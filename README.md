# The ugly. Company Ratings and Reviews API Service
API for the The ugly. Company Ratings and Reviews module. Service has been stress tested up to 3,200 RPS (endpoint #1) on three Amazon EC2 instances. Front-end code can be found at [this repo](https://github.com/TheUglyCompany/e-commerce-website).

## Table of Contents
- [Key Technologies](#key-technologies)
- [Documentation](#testing)
  1. [Get Reviews](#1-get-reviews)
  1. [Get Review Metadata](#2-get-review-metadata)
  1. [Post Review](#3-post-review)
  1. [Mark Review as Helpful](#4-mark-review-as-helpful)
  1. [Report Review](#5-report-review)

## Key Technologies
- [ExpressJS](https://www.npmjs.com/package/express)
- [Jest](https://www.npmjs.com/package/jest)
- [Node.js](https://nodejs.org)
- [PostgreSQL](https://www.postgresql.org/)
## Documentation
### **1. Get Reviews**

Returns a list of reviews for a particular product. This list does not include any reported reviews.

**`GET /reviews?product_id=<value>&sort=<value>&page=<value>&count=<value>`**

**Query Parameters**
<font size="2">
| Parameter | Type   | Description                    |
| ---       | ---    | ---                            |
| page  | integer | Selects the page of results to return. Default 1. |
| count  | integer | Specifies how many results per page to return. Default 5. |
| sort  | text | Changes the sort order of reviews to be based on "newest", "helpful", or "relevant" |
| product_id  | integer | Specifies the product for which to retrieve reviews. |
</font>

**Response**

`Status: 200 OK`
<font size="1">
```json
{
  "product": "2",
  "page": 0,
  "count": 5,
  "results": [
    {
      "review_id": 5,
      "rating": 3,
      "summary": "I'm enjoying wearing these shades",
      "recommend": false,
      "response": null,
      "body": "Comfortable and practical.",
      "date": "2019-04-14T00:00:00.000Z",
      "reviewer_name": "shortandsweeet",
      "helpfulness": 5,
      "photos": [{
          "id": 1,
          "url": "urlplaceholder/review_5_photo_number_1.jpg"
        },
        {
          "id": 2,
          "url": "urlplaceholder/review_5_photo_number_2.jpg"
        },
        // ...
      ]
    },
    {
      "review_id": 3,
      "rating": 4,
      "summary": "I am liking these glasses",
      "recommend": false,
      "response": "Glad you're enjoying the product!",
      "body": "They are very dark. But that's good because I'm in very sunny spots",
      "date": "2019-06-23T00:00:00.000Z",
      "reviewer_name": "bigbrotherbenjamin",
      "helpfulness": 5,
      "photos": [],
    },
    // ...
  ]
}
```
</font>

### **2. Get Review Metadata**

Returns review metadata for a specific product.

**`GET /reviews/meta?product_id=<value>`**

**Query Parameters**
<font size="2">
| Parameter | Type   | Description                    |
| ---       | ---    | ---                            |
| product_id  | integer | Product ID of the product to get review metadata for (required) |
</font>

**Response**

`Status: 200 OK`
<font size="1">
```json
{
  "product_id": "2",
  "ratings": {
    2: 1,
    3: 1,
    4: 2,
    // ...
  },
  "recommended": {
    0: 5
    // ...
  },
  "characteristics": {
    "Size": {
      "id": 14,
      "value": "4.0000"
    },
    "Width": {
      "id": 15,
      "value": "3.5000"
    },
    "Comfort": {
      "id": 16,
      "value": "4.0000"
    },
    // ...
}
```
</font>

### **3. Post Review**

Post a review for a specific product.

**`POST /reviews`**

**Query Parameters**
<font size="2">
| Parameter | Type   | Description                    |
| ---       | ---    | ---                            |
| product_id  | integer | Product ID of the product to post the review for (required) |
| rating | integer | 	Integer (1-5) indicating the review rating |
| summary | text | Summary text of the review |
| body | text | Continued or full text of the review |
| recommend | boolean | Value indicating if the reviewer recommends the product |
| name | text | Username for reviewer |
| email | text | Email address for the reviewer |
| photos | [text] | Array of text urls that link to images to be shown |
| characteristics | object | Object of keys representing characteristic_id and values representing the review value for that characteristic. { "14": 5, "15": 5 //...} |

</font>

**Response**

`Status: 201 CREATED`

### **4. Mark Review as Helpful**

Updates a review to show it was found helpful.

**`PUT /reviews/:review_id/helpful`**

**Parameters**
<font size="2">
| Parameter | Type   | Description                    |
| ---       | ---    | ---                            |
| review_id  | integer | Review ID of the review to mark helpful (required) |
</font>

**Response**

`Status: 204 NO CONTENT`

### **5. Report Review**

Updates a review to show it was reported. Note, this action does not delete the review, but the review will not be returned in the above GET request.

**`PUT /reviews/:review_id/report`**

**Parameters**
<font size="2">
| Parameter | Type   | Description                    |
| ---       | ---    | ---                            |
| review_id  | integer | Review ID of the review to mark reported (required) |
</font>

**Response**

`Status: 204 NO CONTENT`