
const GRAPHQL_URL = 'https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql'

export const fetchGraphQL = async (query, variables) => {
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

    return response.json();
};


export const GQL_GetProfile = /*gql*/`
{
  profile: user {
    firstName
    lastName
    githubId
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

export const GET_LAST_TRANSACTIONS = /*gql*/`
{
  user {
    transactions(limit: 3, where: {type: {_eq: "xp"}}, order_by: {createdAt: desc}) {
      object {
        name
      }
      amount
      createdAt
    }
  }
}`