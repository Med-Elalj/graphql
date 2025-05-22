import { logout } from "./main.js";

const GRAPHQL_URL = 'https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql'

async function fetchGraphQL(query, variables) {
  if (!localStorage.getItem("token")) {
    throw new Error("no token")
  }
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  });

  if (!response.ok) {
    throw new Error('response not ok')
  }

  return await response.json();
}

const fetchData = async (query, variables) => {
  try {
    const response = await fetchGraphQL(query, variables);
    if (Array.isArray(response.errors)) {
      console.log(response.errors[0].message)
      throw new Error(response.errors[0].message);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export class Profile {
  constructor() {
    this.firstName = null;
    this.lastName = null;
    this.login = null;
    this.auditRatio = null;
    this.auditsSucceeded = null;
    this.auditsFailed = null;
    this.level = null;
    return this
  }

  async init() {
    try {
      const response = await fetchData(GQL_GetProfile, {});

      const profile = response?.profile;
      if (Array.isArray(profile)) {
        const userProfile = profile[0];
        this.firstName = userProfile.firstName;
        this.lastName = userProfile.lastName;
        this.login = userProfile.login;
        this.auditRatio = userProfile.auditRatio;
        this.auditsSucceeded = userProfile.audits_succeeded.aggregate.count;
        this.auditsFailed = userProfile.audits_failed.aggregate.count;

        // Assign level data
        this.level = response?.level[0]?.amount;
      } else {
        throw new Error("Invalid data received!");
      }
      return this
    } catch (error) {
      console.error(error);
      logout()
    }
  }
}

export class Data {
  constructor() {
    this.transactions = null;
    this.skills = null;
    this.projects = null;
    this.moduleStartAt = null;
    this.moduleEndAt = null;
    return this
  }
  async init() {
    try {
      // Fetch transactions
      const transactionData = await fetchData(GET_LAST_TRANSACTIONS, {});
      const transactions = transactionData?.user[0]?.transactions;
      if (Array.isArray(transactions)) {
        transactions.forEach(t => t.project = t.project.name);
        this.transactions = transactions;
      } else {
        throw new Error("Invalid transactions data received!");
      }

      // Fetch skills
      const skillsData = await fetchData(GET_Skills, {});
      const skills = skillsData?.user[0]?.skills;
      if (Array.isArray(skills)) {
        this.skills = skills;
      } else {
        throw new Error("Invalid skills data received!");
      }

      // Fetch projects
      const projectsData = await fetchData(GET_Projects, { name: "Module" });
      this.moduleStartAt = new Date(projectsData?.module[0]?.startAt);
      this.moduleEndAt = new Date(projectsData?.module[0]?.endAt);
      const projects = projectsData?.projects;
      if (Array.isArray(projects)) {
        projects.forEach(p => p.project = p.project.name);
        this.projects = projects;
      } else {
        throw new Error("Invalid projects data received!");
      }
      return this
    } catch (error) {
      console.error("An error occurred during initialization:", error);
      logout()
    }
  }
  renderTransactions() {
    if (!Array.isArray(this.transactions)) {
      throw new Error("data not loaded yet")
    };

    if (!Array.isArray(this.transactions)) {
      return `<tr><td>sorry error occured during fetching of transactions</td></tr>`
    }
    let res = ""
    this.transactions.forEach((t) => {
      res += `<tr><td>${t.project || "couldn't get project name"
        }</td><td>${((t.amount > 9999) ? (t.amount / 1000).toFixed(0) + " KB" : t.amount + "B") || "couldn't get xp"
        }</td><td>${t.createdAt.slice(0, 10) || "couldn't get date"
        }</td></tr>`
    })
    return res
  }
}

const GQL_GetProfile = /*gql*/`
{
  profile: user {
    firstName
    lastName
    login
    auditRatio
    audits_succeeded: audits_aggregate(where: {closureType: {_eq: succeeded}}) {
      aggregate {
        count
      }
    }
    audits_failed: audits_aggregate(where: {closureType: {_eq: failed}}) {
      aggregate {count}
    }    
  }
  
    level: transaction(
    where: {
      _and: [
        { type: { _eq: "level" } },
        { event: { object: { name: { _eq: "Module" } } } }
      ]
    }
    order_by: { amount: desc }
    limit: 1
  ) {
    amount
  }
}`

const GET_LAST_TRANSACTIONS = /*gql*/`
{
  user {
    transactions(limit: 5, where: {type: {_eq: "xp"}}, order_by: {createdAt: desc}) {
      project:object {
        name
      }
      amount
      createdAt
    }
  }
}`

const GET_Skills = /*gql*/`
{
  user {
    skills :transactions(
      where: { type: { _nin: ["xp", "level", "up", "down"] } }
      distinct_on: type
      order_by: {type: asc, amount: desc}
    ) {
      name:type
      level:amount
    }
  }
}`

const GET_Projects = /*gql*/`
query GetProjects($name: String!) {
  module:event(where: {object: {name: {_eq: $name}}}){
    startAt
    endAt
  }
  projects:transaction(
    where: {
      _and: [
        { type: { _eq: "xp" } }, 
        { event: { object: { name: { _eq: $name } } } },
      ]
    },
    order_by: {createdAt: asc}
  ) {
    xp: amount
    project: object {
      name
    }
    createdAt
  }
}`