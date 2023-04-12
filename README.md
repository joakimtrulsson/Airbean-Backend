# Airbean API Documentation

This Airbean API was created for learning purposes using different "often used" technologies for example:

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT Token
- bcrypt
- Express-rate-limit
- Validator
- Helmet
- Express-mongo-sanitize
- Xss-clean
- Hpp
- Pug
- Html-To-Text
- https://github.com/leemunroe/responsive-html-email-template Email Template
- Stripe Payment

## The application is divided by

- Routes
- Controllers
- Models
- Utils

### Start Application

**Install dependencies using npm :**

`npm install`

**Create .env file in root folder with following variables :**

- `NODE_ENV`=production
- `PORT`=8000
- `DATABASE_CONNECTION`=
- `DATABASE_SERVER`=
- `DATABASE_USER`=
- `DATABASE_PASSWORD`=
- `JWTEXPIRATION`=
- `SECRET`=JWTSECRET
- `TOKEN_COOKIE_EXPIRES_IN`=
- `EMAIL_USERNAME`=
- `EMAIL_PASSWORD`=
- `EMAIL_HOST`=
- `EMAIL_PORT`=
- `EMAIL_FROM`=
- `EMAIL_USERNAME_DEV`=
- `EMAIL_PASSWORD_DEV`=
- `EMAIL_HOST_DEV`=
- `EMAIL_PORT_DEV`=
- `STRIPE_SECRET_KEY`=
- `STRIPE_WEBHOOK_SECRET`=

**_Example :_**

Mongodb connection URI:
`${DATABASE_CONNECTION}${DATABASE_USER}:${DATABASE_PASSWORD}${DATABASE_SERVER}`

### Available scripts in `package.json`

#### \_Start server using nodemon as filewatcher

`nodemon server.js`

#### _Start server without filewatcher (with node command)_

`node server.js`

## Api Routes

### Open Routes

- **GET: All Products - /api/product/**

- Response:

```
 {
    status: 'success',
    results: 2,
    data: {
      allDocs: [
        {
          id: 'productId',
          title: 'Macbook Pro',
          desc: 'Macbook Pro med inbyggd mugghållare.',
          price: 3999,
          ratingsAverage: 5,
          ratingsQuantity: 2,
          reviews: [
            {
              id: 'id',
              review: 'text?',
              rating: 5,
              createdAt: 'date',
              user: {
                name: 'Emmy Trulsson',
                id: 'userId',
              },
              product: {
                id: 'productId',
                title: 'Macbook Pro med inbyggd mugghållare.',
              },
            },
            {
              id: 'id',
              review: 'text.',
              createdAt: 'date',
              rating: 5,
              user: {
                id: 'userId',
                name: 'userName',
              },
              product: {
                id: 'productId',
                title: 'Macbook Pro med inbyggd mugghållare.',
              },
            },
          ],
        },
        {
          id: 'productId',
          title: 'Brygg kaffe',
          desc: 'En helt vanlig kaffe.',
          price: 39,
          ratingsAverage: 5,
          ratingsQuantity: 1,
          reviews: [
            {
              id: 'id',
              review: 'text',
              rating: 5,
              createdAt: 'date',
              user: {
                id: 'userId',
                name: 'userName',
              },
              product: {
                id: 'productId',
                title: 'Brygg kaffe',
              },
            },
          ],
        },
      ],
    },
  },
```

- **POST: Sign up - api/user/signup**

- Body:

```
  {
    username: 'username',
    password: 'password',
    passwordConfirm: 'password',
  },
```

- Response:

```
 {
    status: 'success',
    token: 'token',
    data: {
      user: {
        username: 'username',
        id: 'objectId',
      },
    },
  },
```

>     Cookie => Token

- **POST: Sign in - /api/user/login**

- Body:

```
{
  {
    username: 'username',
    password: 'password',
  },
}
```

- Response:

```
  {
    status: 'success',
    token: 'token',
    data: {
      user: {
        username: 'username',
        id: 'objectId',
      },
    },
  },
```

>     Cookie => Token

## Signed In as User Routes

#### Token is stored in a cookie.

##### Token is validated in each request

- **GET: Signout - /api/users/logut**

- Response:

```
Returns a cookie with token value "loggedout".
```

- **POST: Forgot password - /api/users/forgotpassword**

- Body

```
  {
    "email": "email",
  }
```

- Response:

```
  Sends a email to user with a link to reset password form.
```

- **PATCH: Reset password - /api/users/resetpassword/:token**

- Body

```
  {
    "passoword": "password",
    "passowordConfirm": "password",
  }
```

- Response:

```
  Same as Sign in/Sign Up
```

- **PATCH: Update password - /api/users/updatemypassword**

- Body

```
  {
    passoword: 'password',
    passowordConfirm: 'password',
  },
```

- Response:

```
  Same as Sign in/Sign Up
```

- **PATCH: Update Me - /api/users/updateme**

- Body

```
  {
    "name": "newname",
  }
```

- Response:

```
  {
    status: 'success',
    data: {
      user: updatedUser,
    },
  },
```

- **POST: Create checkout-session - /api/orders/checkout-session**

- Body

```
  {
    _id: 'objectId',
    quantity: 2,
  },
  {
    _id: 'ObjectId',
    quantity: 1,
  },
```

- Response:

```
 {
    status: 'success',
    data: {
      order: {
        id: 'ObjectId',
        finishedAt: 'createdAt + random x minutes',
        eta: Number,
        totalPrice: 'totalProductPrice + totalProductPrice',
        createdAt: 'Date',
        products: [
          {
            _id: 'ObjectId',
            title: 'title',
            price: xx,
            quantity: 2,
            totalProductPrice: 'price x quantity',
          },
          {
            _id: 'ObjectId',
            title: 'title',
            price: xx,
            quantity: 1,
            totalProductPrice: 'price x quantity',
          },
        ],
      },
    },
  },
```

- **GET: Get Order Status - /api/orders/orderstatus/:id**

- Response

```
  {
    status: 'success',
    data: {
      updatedEta: Number,
    },
  },
```

- **GET: Order history - /api/orders/order-history**

- Response

```
 {
    status: 'success',
    results: 1,
    data: {
      allDocs: [
        {
          id: '642130807c73fd2a86573427',
          products: [
            {
              id: '641362674261f5c1fb2ef349',
              title: 'Brygg kaffe',
              price: 39,
              quantity: 1,
              totalProductPrice: 39,
            },
            {
              id: '64142c06868b66b7c6fa97ca',
              title: 'Klassisk kanelsnäcka',
              price: 29,
              quantity: 1,
              totalProductPrice: 29,
            },
          ],
          user: {
            id: '6412e4aadf3816c8eac75e2e',
            username: 'emmy',
            id: '6412e4aadf3816c8eac75e2e',
          },
          paymentId: 'id',
          totalPrice: 68,
          paid: true,
          eta: 19,
          createdAt: '2023-03-27T05:58:24.046Z',
          updatedAt: '2023-03-27T05:58:24.046Z',
        },
      ],
    },
  },
```

- **GET: User Data - /api/user/me**

- Response

```
 {
    _id: 'id',
    name: 'name',
    username: 'username',
    email: 'email',
    role: 'user',
    photo: 'userimg.jpeg',
    passwordChangedAt: 'time',
    reviews: [
      {
        _id: '641da1b64031259eebb2b0dc',
        review: 'Starkt kaffe!',
        rating: 5,
        createdAt: 'time',
        user: {
          _id: 'id',
          name: 'username',
        },
        product: {
          _id: '641362a54261f5c1fb2ef34f',
          title: 'Enkel Espresso',
        },
      },
    ],
  },
```

- **POST: Create a review - /api/reviews**

- Body

```
  {
    review: 'Helt okej kanelsnäcka',
    rating: 3,
    product: 'productId',
  },
```

- Response:

```
  {
    status: 'success',
    data: {
      review: 'Helt okej kanelsnäcka',
      rating: 3,
      createdAt: 'date',
      user: 'userId',
      product: 'productId',
    },
  },
```

- **DELETE: Delete a review - /api/reviews/id**

- Response:

```
  {
    "status": "success",
  }
```

- **DELETE: Deactive Me - /api/deleteme**

- Response:

```
  {
    "status": "success",
  }
```

## Admin Routes

#### Token is stored in a cookie.

##### Token and role is validated in each request

- **GET: All orders - /api/orders**

- Response:

```
 {
    status: 'success',
    results: 1,
    data: {
      allDocs: [
        {
          id: '642130807c73fd2a86573427',
          products: [
            {
              id: '641362674261f5c1fb2ef349',
              title: 'Brygg kaffe',
              price: 39,
              quantity: 1,
              totalProductPrice: 39,
            },
            {
              id: '64142c06868b66b7c6fa97ca',
              title: 'Klassisk kanelsnäcka',
              price: 29,
              quantity: 1,
              totalProductPrice: 29,
            },
          ],
          user: {
            id: '6412e4aadf3816c8eac75e2e',
            username: 'emmy',
            id: '6412e4aadf3816c8eac75e2e',
          },
          paymentId: 'id',
          totalPrice: 68,
          paid: true,
          eta: 19,
          createdAt: '2023-03-27T05:58:24.046Z',
          updatedAt: '2023-03-27T05:58:24.046Z',
        },
      ],
    },
  },
```

- **DELETE: Delete order - /api/orders/id**

- Response:

```
  {
    status: "success",
  }
```

- **POST: Add a product to menu - /api/product/**

- Body:

```
  {
    title: 'Espresso',
    desc: 'En enkel espresso.',
    price: 43,
  },
```

- Response:

```
  {
    status: 'success',
    data: {
      title: 'En enkel espresso.',
      desc: 'En enkel espresso.',
      price: 43,
      ratingsAverage: 4,
      ratingsQuantity: 0,
      _id: 'objectid',
    },
  },
```

- **PATCH: Update a product - /api/product/:id**

- Body:

```
  {
    "title": "En Fluffig Semla"
  }
```

- Response:

```
  {
    status: 'success',
    data: {
      title: 'newtitle',
      _id: 'objectid',
    },
  },
```

- **DELETE: Delete product - /api/product/id**

- Response:

```
  {
    status: "success",
  }
```

- **GET: Get all users - /api/users**

- Response:

```
{
    status: 'success',
    results: 1,
    data: {
      allDocs: [
        {
          '_id': 'userid',
          name: 'name',
          username: 'username',
          email: 'email',
          role: 'admin',
          passwordChangedAt: 'date',
          photo: 'userimg.jpeg',
          reviews: [],
        },
      ],
    },
  },
```

- **DELETE: Delete user - /api/user/id**

- Response:

```
  {
    status: "success",
  }
```

- **PATCH: Update user - /api/user/id**

- Body

```
  {
    "role": "admin",
  }
```

- Response:

```
  {
    status: 'success',
    data: {
      user: updatedUser,
    },
  },
```

- **GET: Get top rated products - /api/product/top-5-products**

- Response:

```
{
    status: 'success',
    results: 5,
    data: {
      allDocs: [
        {
          '_id': '641362a54261f5c1fb2ef34f',
          title: 'Enkel Espresso',
          price: 45,
          ratingsAverage: 5,
          reviews: [
            {
              _id: '641da1b64031259eebb2b0dc',
              review: 'Starkt kaffe!',
              rating: 5,
              createdAt: '2023-03-24T13:11:06.019Z',
              user: {
                _id: '6412e4aadf3816c8eac75e2e',
                name: 'Emmy Trulsson',
                id: '6412e4aadf3816c8eac75e2e',
              },
              product: {
                _id: '641362a54261f5c1fb2ef34f',
                title: 'Enkel Espresso',
              },
            },
          ],
        },
      ],
    },
  },
```

- **GET: Get most sold products - /api/product/most-sold-products**

- Response:

```
{
    status: 'success',
    data: {
      stats: [
        {
          _id: '641362674261f5c1fb2ef349',
          title: 'Brygg kaffe',
          totalSold: 24,
        },
        {
          _id: '641362af4261f5c1fb2ef352',
          title: 'Dubbel Espresso',
          totalSold: 15,
        },
        {
          _id: '641362854261f5c1fb2ef34c',
          title: 'Kaffe Latté',
          totalSold: 13,
        },
      ],
    },
  },
```

- **GET: Get sales stats - /api/orders/total-income**

- Response:

```
  {
    status: 'success',
    data: [
      {
        totalIncome: [
          {
            total: 19613,
          },
        ],
      },
      {
        monthlyIncome: [
          {
            _id: 1,
            monthTotal: 114,
          },
          {
            _id: 3,
            monthTotal: 4420,
          },
          {
            _id: 4,
            monthTotal: 15079,
          },
        ],
      },
    ],
  },
```
