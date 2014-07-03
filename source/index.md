---
title: Arbiter Documentation

language_tabs:
  - python
  - csharp

toc_footers:
  - <a href='https://www.arbiter.me/dashboard/' target='_blank'>Login to your Developer Dashboard</a>

search: true
---


# Getting Started

## Core Classes

Arbiter has 3 core classes that you will interact with as you develop your game. This 2-minute overview of the classes will help you understand what code you'll need to write!

### User

```python
# Example User
'user': {
    'id': 'd8b50f95c8a24f24a7c64c9d3d5dde5f',
    'token': '3d2fcd21dcd22ae1d64b799c486a959aeee42fbb',
    'claim_account_url': 'https://www.arbiter.me/api/v1/user/40628a4750f74b7a9e1827812e7af815/f80819ef573f699c2723b0c15f1c24bf704ae8a5ef5363083434831bed36c518',
    'is_verified': false,
    'username': 'anonymous'
}
```

Your users' devices interact directly with our server. The first time a player's device connects with Arbiter, we create an anonymous `User` and return a unique ID for that user. This ID is what you will use to make requests on that user's behalf in the future from your server. By default, all users are playing anonymously. At any point, they can create login credentials for their account to log back in with those credentials using our Login API.


### Wallet

```python
# Example Wallet
'wallet': {
    'deposit_address': '1JbbREwe8Vb9DAVzB2zWtNYvKDYLyjyV3C',
    'balance': '50',
    'pending_balance': '623'
}
```

Each Arbiter `User` is given an Arbiter `Wallet`. This request will occur directly between your players' device and the Arbiter server. The user can then deposit to this wallet using a Credit Card, PayPal, or with Bitcoin. At any point, a user can make a withdrawal from their Arbiter Wallet back to any Debit Card, PayPal account, or Bitcoin address.

### Tournament

```python
# Example Tournament
'tournament': {
    'id': '7b62cac5dd164104955468ff80ee6d26'
    'buy_in': '100',
    'balance': '100',
    'users': [{'id': 'd8b50f95c8a24f24a7c64c9d3d5dde5f', 'score': None}],
}
```

Tournaments are the core class handling all the betting interactions between your players. Your server will create a new `Tournament` for each betting interaction between the players in your game. Once a `Tournament` has been created, your users will be able to buy in to the `Tournament`. After your users have finished battling it out in your game, your server will report who won. Arbiter will then charge a transacaction fee (some for us, and some for you) and then release the remaining funds in the `Tournament` to the winning user's Arbiter `Wallet`.


## No backend required

Arbiter is flexible enough to work with multiple patterns


## RESTful

The Arbiter API follows RESTful patterns, returns consistent JSON structures in every response, and relies on built-in HTTP features. As long as you are familiar with the standard HTTP features, the API should behave straight forward.

## HTTP Status Codes

Our API uses HTTP status codes to help you track down an issue if the API is not working as you would expect.

Code | Type | Description
---- | ---- | ----
`200` | OK | The requested action was successful.
`400` | Bad Request | A required parameter was missing or invalid.
`401` | Unauthorized | Missing or invalid access token in your Authorization Header.
`404` | Not Found | Incorrect url or ID in a url.
`500` | Server Error | Something went wrong on our end. We get notified every single time you see this and are looking into what caused the problem.

## Response Objects

```python
# Example response from https://www.arbiter.me/api/v1/wallet/
{
    'success': true,
    'wallet': {
        'deposit_address': '1Mdx1V81LJeyZk6yBizRny6KXxyMTXHGpw',
        'balance': '0'
    }
}
```

All APIs return json with the following keys:

Field | Type |  Description
------- | ------- | -------
success | Boolean | Whether or not the requested action was performed.
OBJECT_NAME | dictionary | A dictionary containing the relavant object being queried or edited. This key will be the name of object type (ie: user, wallet, tournament, etc).
errors | array | An array of errors (if any errors occurred).

Before digging into the details below, spend 2 minutes reading the [Core Classes](/?python#core-classes) section. It will get you familiar with the core classes you will be interacting with.

## Authentication

```python
# Example request with Authorization Header
import requests

USER_TOKEN = '3d2fcd21dcd22ae1d64b799c486a959aeee42fbb'
GAME_API_KEY = 'd6416b1e9be84c53b07524e37f94499d'
headers = {
    'Authorization': 'Token '+USER_TOKEN+'::'+GAME_API_KEY
}
r = requests.post('https://www.arbiter.me/api/v1/user/details', headers=headers)
```

Authentication with Arbiter is two fold. Both your server and your users need the ability to make authenticated requests to Arbiter. To do so, all requests include both a game API key and a user token.

### Game API Key

When you create a game using the [Game Configuration Form](#configure-your-game), an API key is generated for that game. This key is required for all requests to identify which game the requests are for.

### Developer Access Token

For request made between your server and Arbiter, your developer access token is required to authorize your access to the API. Your developer access token is available in your [Account Settings](https://www.arbiter.me/dashboard/settings/).

### User Access Token

The user token is used the same as your Developer Access Token except to authenticate your users' requests between their devices and the Arbiter server. User tokens are returned in the [User Initialize](#initialize) and [User Details](#details) responses. Once a user has been queried, save their token in their client for future requests.

<aside class="warning">
    If you decide to save user tokens in your database, be sure you are sending the tokens using SSL and encrypting your database fields.
</aside>

Once you have all your keys and tokens and are ready to make a request, you'll combine them into a single field in the Authorization Header of your requests.

```python
headers = {
    'Authorization': 'Token <ACCESS_TOKEN>::<GAME_API_KEY>'
}
```
The format of the header is 'Token `ACCESS_TOKEN`::`GAME_API_KEY`'. Depending on whether your server is making the request or if the request is coming from a user's client, the `ACCESS_TOKEN` should be either your `Developer Access Token` or the `USER ACCESS TOKEN`.

## Configure Your Game

[Create an Arbiter developer account](https://www.arbiter.me/developer-registration/) to configure your game and save  your API Key.

Configuring your game
In your dashboard, click the 'Register new game' button in the games tab.

### Game Configuration Form

Field  | Description
--------- | -----------
name | A label for your game.
rake amount | The percentage of each player payout you want to charge. Valid range is 0 through 99. `payout = balance - your rake % - Arbiter fee (5%)`.
matchmaking | Will this game use Arbiter's Matchmaking service to find similar skilled challengers when a user requests a match?

Once you have saved the configuration form, an API key will be generated for your game. Store this on your server for making authenticated calls. See <a href="#authentication">Authentication</a> for more on how to make authenticated requests.

# User API

## Initialize

```python
import requests

r = requests.get('https://www.arbiter.me/api/v1/user/initialize')

r.json()
{
    'success': true,
    'user': {
        'id': 'd8b50f95c8a24f24a7c64c9d3d5dde5f',
        'token': '3d2fcd21dcd22ae1d64b799c486a959aeee42fbb',
        'claim_account_url': 'https://www.arbiter.me/api/v1/user/40628a4750f74b7a9e1827812e7af815/f80819ef573f699c2723b0c15f1c24bf704ae8a5ef5363083434831bed36c518',
        'is_verified': false,
        'username': 'anonymous'
    }
}
```

The initialize call should be made at the beginning of every user's session in your game. Arbiter creates an anonymous session for the user. The session is managed through the `token` returned in the first response.

Future requests made for this user require the `token` in the request headers. Store the user.id and user.token in your database or locally on the device for future requests.

### Request URL

`GET https://www.arbiter.me/api/v1/user/initialize`

### Returned User Object

Field | Type | Description
---- | ---- | ----
id | string | Unique Arbiter ID for this user. Save this in your DB for requests involving this users
token | string | Authentication token for this user. Save this in your DB and keep it private. This will be included in request headers in future requests to authenticate a request made on behalf of this user.
is_verified | boolean | Whether or not this user has agreed to Arbiter's Terms of Service.
username | string | Display name of this user. If they have not created an account using the claim_url, this will be anonymous
claim_account_url | string | A unique URL for this user to claim their Arbiter Account. Once they have claimed their account, they can login to their [Player Dashboard](https://www.arbiter.me/dashboard/). They can also use their account credentials to login to an Arbiter enabled game and have access to their existing wallet created in a previous session.

## Agree to Terms of Service

```python
import requests

# id and token returned from the /user/initialize call
user_id = 'd8b50f95c8a24f24a7c64c9d3d5dde5f'
user_token = '3d2fcd21dcd22ae1d64b799c486a959aeee42fbb'

# Game API Key from your developer dashboard
api_key = 'd6416b1e9be84c53b07524e37f94499d'

url = 'https://www.arbiter.me/api/v1/user/' + user_id + '/verify'
headers = {
    'Authorization': 'Token ' + user_token + '::' + api_key
}
r = requests.post(url)

r.json()
{
    success: True
}
```

Before a user can participate in a wager, we need to confirm that the user is over 18, their local jurisdiction allows skill based betting online, and they need to agree to the [Arbiter Terms of Service](https://www.arbiter.me/terms/). Display the exact text below with a confirmation button that posts to the the confirmation API.

<aside class='notice'>
    By clicking the confirmation button below, you agreeing to the [Arbiter Terms of Service](https://www.arbiter.me/terms/) and confirming that you are at least 18 years of age.
</aside>

### Request URL

`POST https://www.arbiter.me/api/v1/user/<USER ID>/verify`

### Returns

Field | Type | Description
---- | ---- | ----
success | boolean | Whether or not the user's account was successfully verified

## Details

```python
import requests

# id and token returned from the user/initialize or user/login call
# IMPORTANT: Keep your users' tokens private
user_id = 'd8b50f95c8a24f24a7c64c9d3d5dde5f'
user_token = '3d2fcd21dcd22ae1d64b799c486a959aeee42fbb'

# game API Key from your developer dashboard
api_key = 'd6416b1e9be84c53b07524e37f94499d'

headers = {
    'Authorization': 'Token ' + user_token + '::' + api_key
}
url = 'https://www.arbiter.me/api/v1/user/' + user_id

r = requests.get(url, headers=headers)

r.json()
{
    'success': true,
    'user': {
        'id': 'd8b50f95c8a24f24a7c64c9d3d5dde5f',
        'is_verified': true,
        'username': 'anonymous',
        'token': '3d2fcd21dcd22ae1d64b799c486a959aeee42fbb'
    },
    'wallet': {
        'deposit_address': '1JbbREwe8Vb9DAVzB2zWtNYvKDYLyjyV3C',
        'deposit_address_qr_code': 'https://chart.googleapis.com/chart?cht=qr&chl=bitcoin%3A1JbbREwe8Vb9DAVzB2zWtNYvKDYLyjyV3C&choe=UTF-8&chs=300x300',
        'withdraw_address': null,
        'balance': '50',
        'pending_balance': '623'
    }
}

```

Returns details for a user.

### Request URL

`GET https://www.arbiter.me/api/v1/user/<USER ID>`

### Returns a User's details

Field | Type | Description
---- | ---- | ----
id | string | Unique ID for this user. Save this ID with the user in your database.
token | string | Access token used for authentication. Store this in your database with the user and keep it secret.
is_verified | boolean | Whether or not the user has agreed to Arbiter's Terms of Service
username | string | If the user has set their username. Defaults to `anonymous`

<aside class='warning'>
    Be sure to keep your users' tokens secret. They are used for authentication and should be treated like a password.
</aside>

# Wallet API

## Details

```python
import requests

# id and token returned from the user/initialize or user/login call
# IMPORTANT: Keep your users' tokens private
user_id = 'd8b50f95c8a24f24a7c64c9d3d5dde5f'
user_token = '3d2fcd21dcd22ae1d64b799c486a959aeee42fbb'

# game API Key from your developer dashboard
api_key = 'd6416b1e9be84c53b07524e37f94499d'

headers = {
    'Authorization': 'Token ' + user_token + '::' + api_key
}
url = 'https://www.arbiter.me/api/v1/wallet/' + user_id

r = requests.get(url, headers=headers)

r.json()
{
    'success': true,
    'wallet': {
        'deposit_address': '1JbbREwe8Vb9DAVzB2zWtNYvKDYLyjyV3C',
        'deposit_address_qr_code': 'https://chart.googleapis.com/chart?cht=qr&chl=bitcoin%3A1JbbREwe8Vb9DAVzB2zWtNYvKDYLyjyV3C&choe=UTF-8&chs=300x300',
        'withdraw_address': null,
        'balance': '50',
        'pending_balance': '623'
    }
}
```

### Request URL

`GET https://www.arbiter.me/api/v1/wallet/<USER ID>`

### Returns a user's Wallet details

Field | Type | Description
---- | ---- | ----
balance | integer | The amount of Arbiter credits this user has available to bet with.
pending_balance | integer | The amount of Arbiter credits that are currently pending confirmation.
deposit_address | string | Bitcoin deposit address for the user to deposit bitcoin in exchance for Arbiter credits.
deposit_address_qr_code | url | Image URL to a QR code for depositing Bitcoin.
withdraw_address | string | If the user has cashed out to a Bitcoin address in the past, we include this value to autopopulate their cash out form

## Deposit

You have a few options to choose from for how you want to let your users deposit funds into their wallets. Once you have decided how you want your players to deposit funds, we have 3 different payment options to choose from

### In game using Bitcoin

Once you have queried a user's wallet, display the `wallet.deposit_address` or the `wallet.deposit_address_qr_code` to the user. Then the user can use any Bitcoin wallet app to deposit Bitcoin to their address. We suggest either polling or including a refresh button for the user to trigger wallet queries after placing a deposit.

<aside>
Bitcoin is exchanged at time of deposit and withdraw at [Coinbase's Exchange Rates](https://coinbase.com/charts). We instantly accept $0.50 worth of Bitcoin into the user's wallet at time of deposit. The remaining deposit is moved into the user's `pending_balance`. We wait for 2 confirmations from the Bitcoin network before moving the `pending_balance` into the user's `balance`.
</aside>

### In game using Credit Card

Documentation coming soon...

### In game using PayPal

Documentation coming soon...

### Link them to their web dashboard

If you don't want to deal with implementing the Deposit API, you can link the user to their [Web Dashboard](https://www.arbiter.me/dashboard/wallet/). However, they will need to create account credentials using the [Claim Account API] in order to login in to their web dashboard.

## Cash Out

Docuementation coming soon...

# Tournament API

Tournaments are the core class handling all the betting interactions between your players. All of your tournaments will follow this flow:

1. Your server requests a  new `Tournament` using the <a href="#create">Create API</a>.
2. Users buy into the `Tournament` using the <a href="#add-user">Add User API</a>.
3. Your players play your game.
4. Your server reports the winner of the game to the <a href="#report-score">Report Score API</a>.
5. Arbiter will calculate the transactions fees and release the winnings.

<aside>
    <strong>If your game has matchmaking enabled:</strong><br>
    Be sure to read [Tournament Create With Matchmaking](#create-with-matchmaking)
</aside>

## Create

```python
import requests

# Token is returned from the user/initialize or user/login call
# IMPORTANT: Keep your users' tokens private. Treat these like passwords.
USER_TOKEN = '3d2fcd21dcd22ae1d64b799c486a959aeee42fbb'

# game API Key from your developer dashboard
API_KEY = 'd6416b1e9be84c53b07524e37f94499d'

# Include the user_token requesting the tournament
headers = {
    'Authorization': 'Token ' + USER_TOKEN + '::' + API_KEY
}
url = 'https://www.arbiter.me/api/v1/tournament/create'
payload = {
    'buy_in': 100  # Bet size in Arbiter Credits
}
r = requests.post(url, data=payload, headers=headers)

r.json()
{
    'success': True
    'tournament': {
        'id': '7b62cac5dd164104955468ff80ee6d26'
        'buy_in': '100',
        'balance': '100',
        'users': [{'id': 'd8b50f95c8a24f24a7c64c9d3d5dde5f', 'score': None}],
    }
}
```

### Request URL

`POST https://www.arbiter.me/api/v1/tournament/create`

### Request Parameters

Field | Type | Description
--- | --- | ---
buy_in | integer | The buy in (aka bet size or entry fee) in Arbiter credits for this tournament.

### Returns the tournament's state

Field | Type | Description
---- | ---- | ----
id | string | Unique identifier for this tournament.
buy_in | string | The buy in (aka bet size) in Arbiter credits for this tournament.
balance | string | The current balance of this tournament.
users | array | Array of dictionaries of each user that has successfully bought in to this tournament. Each dictionary has the user's ID and the score reported by your server for each user in this tournament.

## Create with Matchmaking Enabled

```python
# Example success response from Create when matchmaking is enabled
import requests
headers = {...}
payload = {...}
r = requests.post('https://www.arbiter.me/api/v1/tournament/create', data=payload, headers=headers)

print r.status_code
# 200

r.json()
{
    'success': True
}
```

Matchmaking keeps the really good users from ruining new users' first game experiences. When matchmaking is enabled for your game, the [Tournament Create API](#create) may take a couple seconds to find an accurate match. Because of this delay, we return a success response for the request immediately then create the tournament in the background.

After a client successfully requested a new tournament, the client should pull the [Tournament List API](#list) until a new tournament is returned.

```python
# Example list response when pulling
import requests
headers = {...}
r = requests.get('https://www.arbiter.me/api/v1/tournament', headers=headers)

r.json()
{
    'success': True,
    'tournaments': [
        {
            'id': '7b62cac5dd164104955468ff80ee6d26'
            'buy_in': '100',
            'balance': '100',
            'users': [{'id': 'd8b50f95c8a24f24a7c64c9d3d5dde5f', 'score': None}],
            'matched_users': ['d8b50f95c8a24f24a7c64c9d3d5dde5f', 'efc4654a2b9844589a8d77d09628afbf']
        }
    ]
}
```

### Fields on Tournament with Matchmaking Enabled

Field | Type | Description
--- | --- | ---
matched_users | array | User IDs of recently active users of similar skills.

Use the IDs in `matched_users` to notify the corresponding user that they have been matched. In the notification, that user should have a *Buy-in to Tournament* prompt that triggers the [Add User API](#add-user) for that user.


## Details

```python
import requests

# Token is returned from the user/initialize or user/login call
USER_TOKEN = '3d2fcd21dcd22ae1d64b799c486a959aeee42fbb'

# game API Key from your developer dashboard
API_KEY = 'd6416b1e9be84c53b07524e37f94499d'

# Include the token of the User requesting the tournament
headers = {
    'Authorization': 'Token ' + USER_TOKEN + '::' + API_KEY
}
url = 'https://www.arbiter.me/api/v1/tournament/<TOURNAMENT_ID>'
r = requests.get(url, headers=headers)

r.json()
{
    'success': True
    'tournament': {
        'id': '7b62cac5dd164104955468ff80ee6d26'
        'buy_in': '100',
        'balance': '100',
        'users': [{'id': 'd8b50f95c8a24f24a7c64c9d3d5dde5f', 'score': None}]
    }
}
```

### Request URL

`GET https://www.arbiter.me/api/v1/tournament/<TOURNAMENT_ID>`

### Returns the tournaments's state

Field | Type | Description
---- | ---- | ----
id | string | Unique identifier for this tournament.
buy_in | string | The buy in (aka bet size) in Arbiter credits for this tournament.
balance | string | The current balance of this tournament.
users | array | Array of dictionaries of each user that has successfully bought in to this tournament. Each dictionary has the user's ID and the score reported by your server for each user in this tournament.

## List

```python
import requests

# Token is returned from the user/initialize or user/login call
USER_TOKEN = '3d2fcd21dcd22ae1d64b799c486a959aeee42fbb'

# game API Key from your developer dashboard
API_KEY = 'd6416b1e9be84c53b07524e37f94499d'

# Include the token of the User requesting the tournament
headers = {
    'Authorization': 'Token ' + USER_TOKEN + '::' + API_KEY
}

url = 'https://www.arbiter.me/api/v1/tournament'
r = requests.get(url, headers=headers)

r.json()
{
    'success': True
    'tournaments': [
        {
            'id': '7b62cac5dd164104955468ff80ee6d26'
            'buy_in': '100',
            'balance': '100',
            'users': [{'id': 'd8b50f95c8a24f24a7c64c9d3d5dde5f', 'score': None}]
        }
    ]
}
```

### Request URL

`GET https://www.arbiter.me/api/v1/tournament`

### Optional URL Params

Param | Default | Description
--- | --- | ---
page | 1 | Depth of paginated results

### Returns paginated list

TODO: Replace these with the fields to returned in paginated serializer

Field | Type | Description
---- | ---- | ----
id | string | Unique identifier for this tournament.
buy_in | string | The buy in (aka bet size) in Arbiter credits for this tournament.
balance | string | The current balance of this tournament.
users | array | Array of dictionaries of each user that has successfully bought in to this tournament. Each dictionary has the user's ID and the score reported by your server for each user in this tournament.

## Add User

> Before adding a user, create a tournament using the Tournament Create API and save the tournament's ID

```python
import requests

# The user's token is returned from the user/initialize or user/login call
USER_TOKEN = '3d2fcd21dcd22ae1d64b799c486a959aeee42fbb'

# game API Key from your developer dashboard
API_KEY = 'd6416b1e9be84c53b07524e37f94499d'

# Include the user_token requesting the tournament
headers = {
    'Authorization': 'Token ' + USER_TOKEN + '::' + API_KEY
}
url = 'https://www.arbiter.me/api/v1/tournament/<TOURNAMENT_ID>/add-user/<USER_ID>'
r = requests.post(url, headers=headers)

r.json()
{
    'success': True
    'tournament': {
        'id': '7b62cac5dd164104955468ff80ee6d26'
        'buy_in': '100',
        'balance': '200',
        'users': [
            {'id': 'd8b50f95c8a24f24a7c64c9d3d5dde5f', 'score': None},
            {'id': 'efc4654a2b9844589a8d77d09628afbf', 'score': None}
        ]
    }
}
```

Transfers the tournament's buy_in amount from the specified user's wallet to the specified tournament. If no errors occur, then the user will be added to the `users` array and the `tournament.balance` will be updated.

### Request URL

`POST https://www.arbiter.me/api/v1/tournament/<TOURNAMENT_ID>/add-user/<USER_ID>`

### Returns the Jackpot State

Field | Type | Description
--- | --- | ---
id | string | Unique identifier for this tournament.
buy_in | string | The buy in (aka bet size) in Arbiter credits for this tournament.
balance | string | The current balance of this tournament.
users | array | Array of dictionaries of each user that has successfully bought in to this tournament. Each dictionary has the user's ID and the score reported by your server for each user in this tournament.

## Report Score

> Before reporting a score, create a tournament using the Tournament Create API add users to the tournament using the Add User API

```python
import requests

# User tokens are returned in the user/initialize or user/login call
# IMPORTANT: Keep your users' tokens private
USER_TOKEN = '3d2fcd21dcd22ae1d64b799c486a959aeee42fbb'

# game API Key from your developer dashboard
API_KEY = 'd6416b1e9be84c53b07524e37f94499d'

# Include the user_token requesting the tournament
headers = {
    'Authorization': 'Token ' + USER_TOKEN + '::' + API_KEY
}
url = 'https://www.arbiter.me/api/v1/tournament/<TOURNAMENT_ID>/report-score/<USER_ID>'
payload={
    'score': '101'
}
r = requests.post(url, data=payload, headers=headers)

# If all users have reported a score, the tournament will automatically payout
r.json()
{
    'success': True
    'tournament': {
        'id': '7b62cac5dd164104955468ff80ee6d26'
        'buy_in': '100',
        'balance': '0',
        'users': [
            {'id': 'd8b50f95c8a24f24a7c64c9d3d5dde5f', 'score': '101'},
            {'id': 'efc4654a2b9844589a8d77d09628afbf', 'score': None}
        ]
    }
}
```

Once a user has finished playing your game, report their score to Arbiter. Once all the users have reported their scores, Arbiter will compare the scores and set the winner to the user with the highest score. Once a winner has been set, Arbiter will automatically calculate the transaction fees and transfer the remainder of the tournament balance to the winning user's Arbiter wallet.

### Request URL

`POST https://www.arbiter.me/api/v1/tournament/<TOURNAMENT_ID>/report-score/<USER_ID>`

### Request Parameters

Field | Type | Description
--- | --- | ---
score | integer | The score of the user for this tournament.

### Returns the tournament's State

Field | Type | Description
--- | --- | ---
id | string | Unique identifier for this tournament.
buy_in | string | The buy in (aka bet size) in Arbiter credits for this tournament.
balance | string | The current balance of this tournament. If all users have reported their score, this will be 0.
users | array | Array of dictionaries of each user that has successfully bought in to this tournament. Each dictionary has the user's ID and the score reported by your server for each user in this tournament.

# Matchmaking

The Arbiter matchmaking service keeps the good players from ruining new players experiences. When you turn on matchmaking for your game, Arbiter will automatically find an accurate match for a user whenever they request a new Tournament.

## Enable Matchmaking

This is the easiest way to enable matchmaking in your game.

1. Go to games tab in your [Developer Dashboard](https://www.arbiter.me/dashboard/games/)
2. Click *edit* for the game you want to enable matchmaking on.
3. Check the *Enable Matchmaking* box in the configuration form.
4. Click *save*.

Then whenever you make a call to the [Tournement Create API](#create), a new **matched_users** field will be included in the `Tournament` object from the [Tournament Details API](#details).

Field | Type | Description
---- | ---- | ----
matched_users | array | An array of `user.id`'s that have been matched based on the users' skill.

## Override in API

```python
import requests

headers = {...}
payload = {
    'users': [
        {'id': 'd8b50f95c8a24f24a7c64c9d3d5dde5f', 'score': None},
        {'id': 'efc4654a2b9844589a8d77d09628afbf', 'score': None}
    ],
    'buy_in': 100
}
url = 'https://www.arbiter.me/api/v1/tournament/create'
r = requests.post(url, data=payload, headers=headers)

r.json()
{
    'success': True
    'tournament': {
        'id': '7b62cac5dd164104955468ff80ee6d26'
        'buy_in': '100',
        'balance': '0',
        'users': [],
        'matched_users': ['d8b50f95c8a24f24a7c64c9d3d5dde5f', 'efc4654a2b9844589a8d77d09628afbf'],
    }
}
```

There may be edge case scenarios where you do not want to use matchmaking for all tournaments in your game. For example, challenging a friend through Facebook. Even if matchmaking is enabled for a game, including a `users` array in the [Tournament Create API](#create) will disable matchmaking. The tournament will be created with the matched users equal to `users` and return a new tournament back in the response.

# Unity iOS SDK

We have a Unity SDK for speeding up the integration when building a game in Unity for iOS. This package wraps all the API interaction into a single Arbiter class.

## SDK Flow Overview

Below is an outline of the typical flow a user should be taken through when playing an Arbiter enabled game followed by detailed descriptions and code examples of each step. Don't hesitate to message us if you have any questions or issues. [support@arbiter.me](mailto:support@arbiter.me)

### Implementation Prerequisites

Complete these steps before writing any code.

1. [Configure your game](#configure-your-game) in your developer dashboard.
1. [Download the Unity Package](https://github.com/ArbiterGames/Unity-SDK).
1. Import the package into your Unity game.
1. Add the Arbiter Prefab located in `/Assets/Plugins/Arbiter` to your loading scene.
1. Set your game's API key and your developer access token in the Arbiter Game Object's inspector.

### Standard flow for your users

Each step below is done with a call to the Arbiter SDK.

1. Authenticate a user session.
1. Verify the user's age and location (*if this is a new session*).
1. Display the user's wallet details.
1. Prompt the user to deposit Arbiter credits.
1. Have the user join a tournament.
1. Report the user's score for that tournament.
1. View previous tournament results.
1. Let the user withdraw their credits when they are done.
1. Logout

### Quick and Easy Implementation

The SDK includes iOS UIAlertViews for all the Arbiter UI elements (wallet dashboard screen, previous tournaments, deposits / withdraws, etc). This is the quickest way to integrate Arbiter into your game. Once you have added the Arbiter Game Object to your game, you can start making calls to the SDK and iOS UIAlertViews will automatically be displayed to the user with all the available user inputs in the UIAlertView.

### Customized UI Implementation

The alternative implementation is for you to create your own custom UI elements that matches your game's look and feel. As you build out your UI elements, you can bind your buttons directly to the Arbiter SDK methods instead of relying on the pre-built UIAlertView inputs.

## The Arbiter Game Object

Once the Arbiter Game Object has been added to your loading scene, you will have access to the `Arbiter` Class. This class contains all the properties and methods that you will interact with throughout the implementation.

### Properties

Name | Type | Description
--- | --- | ---
UserId | `string` | The user's unique identifier on Arbiter.
Username | `string` | The username or email associated with the current Arbiter account.
AccessToken | `string` | The access token for this user to make authenticated requests to the Arbiter server.
Verified | `bool` | Whether or not the user has agreed to the [Terms and Conditions](https://www.arbiter.me/terms/)
Balance | `string` | The currently available Arbiter credits for this user to bet with.
PendingBalance | `string` | Any pending Arbiter credits in the user's wallet.
DepositAddress | `string` | Bitcoin address for purchasing Arbiter credits with Bitcoin
DepositQrCode | `string` | URL to a QR code for purchasing Arbiter credits with Bitcoin
WithdrawAddress | `string` | If the user has withdrawn Arbiter credits to a Bitcoin address, this field have their most recently used withdraw address.

### Methods

Name | Description
--- | ---
Initialize  | Establishes a new anonymous session between the user's device and the Arbiter server.
LoginWithAccessToken | Establishes a new session for an existing user based on an access token.
LoginWithGameCenter | If the user has already logged into your game using Apple's Game Center, this will link the Game Center user with an Arbiter account.
Login | Displays a native UIAlertView for a user to login to an existing Arbiter account.
Logout | Destroys the current Arbiter session.
VerifyUser | Prompts the user to agree to the [Terms and Conditions](https://www.arbiter.me/terms/) and verifies that your game is legal to bet on in their local jurisdiction.
GetWallet | Updates `Arbiter.Balance` and `Arbiter.PendingBalance`.
DisplayWalletDashboard | Updates Arbiter.Wallet then displays the wallet details in a native UIAlertView along with user inputs such as Deposit and Withdraw.
DisplayDepositFlow | Displays native UIAlertViews that take the user through the checkout process for puchasing Arbiter credits.
DisplayWithdrawFlow | Displays native UIAlertViews that take the user through the checkout process for redeeming Arbiter credits.
JoinTournament | Enters the user in a new tournament.
ReportScore |  Reports the outcome of a tournament for the current user.
GetTournaments | Returns a paginated list of a user's previous tournaments.
DisplayPreviousTournaments | Displays the the paginated list of previous tournaments in a native UIAlertView.


## Initialize

```csharp
public class Entrypoint : MonoBehaviour {

    void Start () {
        Arbiter.Initialize( Callback );
    }

    void Callback() {
        // Will print "Hello, Anonymous!"
        Debug.Log( "Hello, " + Arbiter.Username + "!" );
    }
}
```

Call this the very first time that a user loads your game. This will create a new user on the Arbiter server followed by bootstrapping the `Arbiter` class on the user's device.

**After calling initialize, the following `Arbiter` properties should have values:**

Property | Type | Value
--- | --- | ---
UserId | `string` | A unique identifier for this user.
Username | `string` | Anonymous. Once the user connects with Game Center or creates an Arbiter account through the web dashboard, this will stay as anonymous.
AccessToken | `string` | The token used for authenticating this user in future requests made to the Arbiter server.
Verified | `bool` | `false`. Once `Arbiter.VerifyUser()` is successfully completed, this will be `true`
Balance | `string` | `0`. Once the user successfully deposits Arbiter credits, this will get updated.
PendingBalance | `string` | `0`. If a user deposits using Bitcoin, $0.50 worth of Bitcoin will instantly get added to `Arbiter.Balance`. The remainder will stay in `Arbiter.PendingBalance` until the transaction gets 2 confirmations on the Bitcoin network.
DepositAddress | `string` | A new Bitcoin deposit address for the user to deposit to.
DepositQrCode | `string` | A URL to a QR code for the `Arbiter.DepositAddress`


## Login With Access Token

```csharp
public class Entrypoint : MonoBehaviour {

    private static string accessToken = TOKEN_FROM_YOUR_DATABASE_SAVED_FROM_PREVIOUS_SESSION;

    void Start () {
        Arbiter.LoginWithAccessToken( accessToken );
    }

    void Callback() {
        Debug.Log( "Hello, " + Arbiter.Username + "!" );
    }
}
```

If your game already has user authentication on your server, your users do not have to create new Arbiter account credentials.

The first time a user loads your game, call `Arbiter.Initialize()` to create a new session on Arbiter. This will set `Arbiter.AccessToken` to a string that can be used for authenticated requests for this user. Save that token with the user in your database. Then, whenever one of your users re-loads your game, call `Arbiter.LoginWithAccessToken( accessToken )` to re-establish a session with the correct Arbiter account for that user.

<aside class="warning">
    <strong>Keep your users' access tokens private</strong><br>
    Be sure that you are only sending the tokens over https and that you are storing them encypted in your database. Getting access to a user's token is equivalent to getting access to their username and password.
</aside>


## Login with Game Center

```csharp
public class AnyScriptPriorToBetting : MonoBehaviour {

    void Start () {
#if UNITY_IOS
        Action<bool> processAuth = ( success ) => {
            if( success ) {
                Arbiter.LoginWithGameCenter( Callback );
            } else {
                Debug.LogError( "Could not authenticate to Game Center!" );
            }
        };
        Social.localUser.Authenticate( processAuth );
#endif
    }

    void Callback() {
        Debug.Log( "Hello, " + Arbiter.Username + "!" );
    }
}
```

If your game is setup to integrate with Game Center, a user can connect their Arbiter account with a Game Center account.

Once their Arbiter account has been connected to a Game Center account, they can use their Game Center credentials to establish a new session with their existing Arbiter Wallet in other Arbiter enabled games as well as on other devices.

To connect with a Game Center account, use Unity's [Social API](http://docs.unity3d.com/ScriptReference/Social.html) to get a Game Center [LocalUser](http://docs.unity3d.com/ScriptReference/Social-localUser.html). Once a LocalUser has been created, call `Arbiter.LoginWithGameCenter()` to connect their Game Center account with Arbiter.


## Login with Username / Password

```csharp
public class LoginButton : MonoBehaviour {

    void OnMouseUpAsButton() {
        Arbiter.Login(  Callback );
    }

    void Callback() {
        Debug.Log( "Hello, " + Arbiter.Username + "!" );
    }
}
```

If a user has already created an account through the [Web Registration](https://www.arbiter.me/player-registration) or through the `claim_account_url`, they can re-establish an existing session using the `Arbiter.Login()`. This call will display a UIAlertView with an email and password field. Upon successful login, all the `Arbiter` properties will get set with the correct values.

## Verify The User

```csharp
public class AnyScriptPriorToBetting : MonoBehaviour {

    void VerificationStep() {
        Arbiter.VerifyUser(  Callback );
    }

    void Callback() {
        Debug.Log( Arbiter.Username + " is now verified: " + Arbiter.Verified );
    }
}
```

Whenever a new user is created, in addition to having the user agree to the standard terms and conditions, we need to make sure there are no local regulations restricting them from being able to bet in your game.

**This method will:**

1. Prompt the user to enable location services (if not already enabled).
2. Prompt the user to agree to the [Terms and Conditions](https://www.arbiter.me/terms).
3. Send the user's postal code to the Arbiter server to check the legality of online betting in their location.

## Get Wallet

```csharp
// Setup wallet listeners
public class SetupWalletHandlerScript : MonoBehaviour {
    void Start() {
        Arbiter.AddWalletListener(  UpdateWalletUIElements );
    }

    void UpdateWalletUIElements() {
        Debug.Log( "Balance: " + Arbiter.Balance );
        Debug.Log( "Pending Balance: " + Arbiter.PendingBalance );
    }

    void ExampleOfRemovingWalletListener() {
        Arbiter.RemoveWalletListener( UpdateWalletUIElements );
    }
}

// Bind to a refresh button in your game
public class RefreshWalletButton : MonoBehaviour {
    void OnMouseUpAsButton() {
        Arbiter.GetWallet();
    }
}
```

In addition to updating `Arbiter.Balance`, you can also setup wallet listeners. This way, whenever the wallet is updated, you can bind your own handlers for updating you UI elements and such.

Calling `Arbiter.GetWallet()` will request the latest wallet detials from the server and then setup automatic polling at incrementing intervals. Anytime you call `Arbiter.GetWallet()` the polling intervals will reset the inrements.

### Save time and use our Wallet Dashboard

```csharp
// Bind to a 'Show Wallet' button in your UI
public class DisplayWalletButton : MonoBehaviour {
    void OnMouseUpAsButton() {
        Arbiter.DisplayWalletDashboard();
    }
}
```

To save on implementation time, you can use `Arbiter.DisplayWalletDashboard()` to give your users access to their wallets. This will display all their wallet info in a native UIAlertView with inputs for depositing and withdrawing.

## Deposit Credits

```csharp
// Bind to a 'Deposit Credits' button in your UI
public class DepositCreditsButton : MonoBehaviour {
    void OnMouseUpAsButton() {
        Arbiter.DisplayDepositFlow();
    }
}
```

Before a user can start betting, they will need Arbiter credits. Arbiter credits are the betting currency that users will use to bet in your game. Feel free to call them credits, cents, gold, gems, or whatever makes sense for your game.

`1 Arbiter credit = $0.01 USD`

Use `Arbiter.DisplayDepositFlow()` to display a native UIAlertView for purchasing Arbiter credits. If you are using `Arbiter.DisplayWalletDashboard()`, there is a `Deposit` button in the wallet dashboard for users to purchase Arbiter credits.

## Join a Tournament

```csharp
// Bind to a 'Join Tournament' button in your UI
public class JoinTournamentButton : MonoBehaviour {

    void OnMouseUpAsButton() {
        string betSize = "100";
        Dictionary<string,string> filters = new Dictionary<string,string>();
        filters.Add( "arbitrary_key", "the_value" );
        Arbiter.JoinTournament( betSize, filters, Callback);
    }

    void Callback( Arbiter.Tournament tournament ) {
        // Have the user actually play your game and user Arbiter.ReportScore() to report the outcome.
        Debug.Log( "Joined tournament: " + tournament.Id );
    }
}
```

Now that the user has credits to bet with, they can request to join tournaments. If there are no current tournaments for the user to join, a new tournament will get created. Once the new tournament has been created on the server and is available on the device, load the actually game play scene for the user.

### The Tournament Object

Property | Type | Description
--- | --- | ---
Id | `string` | Unique identifier for a tournament
Status | `string` | `Initializing` The tournament has been created, but is still waiting for all the users to join.<br>`Inprogress` All the users have joined, but not all users have reported their scores.<br>`Complete` All users have reported their scores and the tournament has a winner.
Users | `List<Arbiter.TournamentUser>` | A List of Arbiter users that have joined this tournament. Each user includes the user's `UserId` and a `Score` for this tournament (if they have reported a score yet).
Winner | `Arbiter.TournamentUser` | The winner of this tournament.

<aside class="important">
    **Once a user has requested a tournament, the credits will automatically get transferred from the user's wallet to the tournament pot**.
</aside>

### Using Tournament Filters

```csharp
string betSize = "100";
Dictionary<string,string> filters = new Dictionary<string,string>();
filters.Add( "arbitrary_key", "the_value" );
Arbiter.JoinTournament( betSize, filters, Callback );
```

You can pass in a `filters` dictionary to sort tournaments into different groups. For example, if you want to create a tournament where the users are competing on level 2 of your game, you can set the filters to `{"level": "2"}`. This will make sure that when a user playing level 2 requests a tournament, they will only get matched with other users requesting a tournament for level 2 (rather than level 1 or 3). `level` is just an arbitrary example, this can be set to any string.

## Report Score

```csharp
// Put add these functions on any script that runs at the end of a user playing your game
public class EndOfGameScript : MonoBehaviour {

    // Save the tournament during the JoinTournament callback
    Arbiter.Tournament currentTournament = tournament;

    // Get the players score after playing your game
    int score = 101;

    // Called at the end of a user playing your game
    void HandleUserFinishingGame() {
        Arbiter.ReportScore( currentTournament.Id, score, Callback );
    }

    void Callback( Arbiter.Tournament tournament ) {
        if ( tournament.Status == "Complete" ) {
            if ( tournament.Winner.Id == Arbiter.UserId ) {
                Debug.Log( "You won!" );
            } else {
                Debug.Log( "User " tournament.Winner.Id + " won with a score of " + tournament.Winner.Score );
            }
        } else {
            Debug.Log( "Waiting for the other users to finish playing." );
        }
    }
}
```

After the user has successfully played the game and has generated a numeric score, send the score to the Arbiter server. Once all users in this tournament have reported their scores to the Arbiter server, we will determine the winner based on which user reported the highest score and distribute the credits to the winner's wallet.

## Display Previous Tournaments

```csharp
public class ViewPreviousTournamentsButton : MonoBehaviour {

    void OnMouseUpAsButton() {
        Arbiter.DisplayPreviousTournaments();
    }
}
```


This displays a paginated list of tournaments this user has joined in a native UIAlertView.

## Withdraw Credits

```csharp
public class WithdrawCreditsButton : MonoBehaviour {

    void OnMouseUpAsButton() {
        Arbiter.DisplayWithdrawFlow();
    }
}
```

Once the user is ready convert their Arbiter credits back to USD, call this method to display the withdraw checkout flow. The flow is presented in a native UIAlertView and prompts the user to enter their Debit Card info for the card they want to redeem to.

If you are using `Arbiter.DisplayWalletDashboard()`, then the withdraw flow is already accesible through the native UIAlertView that is displayed  from the `DisplayWalletDashboard()` call.

<aside class="important">
    Withdraws can only be made to debit or bank cards. Our payment processor is unable to approve withdraws made to credit cards.
</aside>

## Logout

```csharp
public class LogoutButton : MonoBehaviour {

    void OnMouseUpAsButton() {
        Arbiter.Logout( Callback );
    }

    void Callback() {
        // Update your UI to display the Login / Initialize flow
    }

}
```

This call will reset all the properties on the `Arbiter` class and end the current session.
