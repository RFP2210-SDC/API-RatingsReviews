// eslint-disable-next-line import/no-unresolved
import http from 'k6/http';
// eslint-disable-next-line import/no-unresolved
import { check, sleep } from 'k6';
// import { NewRel } from './newrelic';

class NewRel {
  constructor(apiKey, log = false) {
    this.log = log;
    this.params = {
      headers: {
        'Content-Type': 'application/json',
        'API-Key': apiKey,
      },
    };
    this.urls = {
      graphql: 'https://api.newrelic.com/graphql',
    };
  }

  PrintAlertingStatus() {
    const payload = JSON.stringify({
      query: `
      {
        actor {
          entitySearch(query: "name LIKE 'Node Workshop' AND domain IN ('APM')") {
            results {
              entities {
                ... on ApmApplicationEntityOutline {
                    alertSeverity
                }
              }
            }
          }
        }
      }
      `,
    });

    const res = http.post(this.urls.graphql, payload, this.params);

    if (this.log) {
      console.log(`New Relic Check HTTP Status is: ${res.status}`);
    }

    if (res.status === 200) {
      const body = JSON.parse(res.body);
      const result = body.data.actor.entitySearch.results.entities[0].alertSeverity;
      console.log(`New Relic Status: ${result}`);
    }
  }

  AppID() {

    // From NerdGraph, copy the GraphQL payload from tools > copy as cURL > take the entire {"query"} section
    const payload = JSON.stringify({
      query: `
      {
        actor {
          entitySearch(query: "name LIKE 'Node Workshop' AND domain IN ('APM')") {
            results {
              entities {
                ... on ApmApplicationEntityOutline {
                  applicationId
                }
              }
            }
          }
        }
      }
    `
    });

    const res = http.post(this.urls.graphql, payload, this.params);
    // Check we are not experiencing HTTP 400. If you are, the payload is likely wrong.

    if (this.log) {
      console.log('New Relic Check HTTP Status is: ' + res.status);
    }


    if (res.status === 200) {
      const body = JSON.parse(res.body);
      /* result will depend on the query. This query is built on alertSeverity result.
       You need to modify the selector if you are performing a different query     */
      var result = JSON.stringify(
        body.data.actor.entitySearch.results.entities[0].applicationId,
      );
    } else {
      throw new Error('Could not fetch AppID from New Relic')
    }

    return result;
  }

  //Send a deployment marker with start/end information on load test.
  Notify(testName, state, description, user) {
    var url =
      'https://api.newrelic.com/v2/applications/' + this.AppID() + '/deployments.json';
    console.log(url);

    // From NerdGraph, copy the GraphQL payload from tools > copy as cURL > take the entire {"query"} section
    const payload = JSON.stringify({
      deployment: {
        revision: testName,
        changelog: `k6 load test ${state}`,
        description,
        user,
      },
    });

    const res = http.post(url, payload, this.params);
    // Check we are not experiencing HTTP 400. If you are, the payload is likely wrong.
    if (![200, 201].includes(res.status)) {
      throw new Error(`Could not notify New Relic about test state (res: ${res.status})`)
    }

    return JSON.stringify(res.status);
  }
}

const apiKey = 'my-api-key';
const nr = new NewRel(apiKey);

export const options = {
  scenarios: {
    '2RPS': {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 50,
      startRate: 0,
      timeUnit: '1s',
      gracefulStop: '1s',
      stages: [
        { target: 2, duration: '3s' },
        { target: 2, duration: '27s' },
      ],
    },
  },
  tags: {
    testName: 'metadataIteration1-03',
    user: 'fusco@case.edu',
  },
};

export function setup() {
  nr.PrintAlertingStatus();
  nr.Notify(
    'Sunday load test - short',
    'START',
    'Beginning E2E load test script',
    'fusco@case.edu',
  );
}

// TESTING SINGLE ENDPOINT - GET /reviews/meta
export default function () {
  const PRODUCT_QTY = 1000011;
  const lbID = PRODUCT_QTY * 0.9;
  const ubID = PRODUCT_QTY;
  const productId = Math.floor(Math.random() * (ubID - lbID) + lbID);

  const res = http.get(`http://localhost:3000/reviews/meta?product_id=${productId}`);
  check(res, { 'status was 200': (r) => r.status === 200 });

  sleep((Math.random() * (6 - 1) + 1) / 1000); // random sleep btw 1 and 6 ms
}

export function teardown(data) {
  nr.Notify(
    'Sunday load test - short',
    'END',
    'Finishing E2E load test script',
    'fusco@case.edu',
    );
  nr.PrintAlertingStatus();
}
