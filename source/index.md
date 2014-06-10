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

Arbiter has 3 core classes that you will interact with as you develop your game. Before writing any code, spend 2 minutes getting familiar with these classes.

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


<aside>
    <strong>Who owns the user?</strong><br>
    You still own your user. The first time a user loads your game with Arbiter installed, we return a unique ID and token for you to store in your user database. All future authentication between Arbiter and your user can be completed using this ID and token.
</aside>

### Wallet

```python
# Example Wallet
'wallet': {
    'deposit_address': '1JbbREwe8Vb9DAVzB2zWtNYvKDYLyjyV3C',
    'balance': '50',
    'pending_balance': '623'
}
```

Each Arbiter `User` is given an Arbiter `Wallet`. This request will occur directly between your players' device and the Arbiter server. The user can then deposit to this wallet using a Credit Card, PayPal, or with Bitcoin. At any point, a user can make a withdraw from their Arbiter Wallet back to any Debit Card, PayPal account, or Bitcoin address.

### Tournament

```python
# Example Tournament
'tournament': {
    'id': '7b62cac5dd164104955468ff80ee6d26'
    'buy_in': '100',
    'balance': '100',
    'users': ['d8b50f95c8a24f24a7c64c9d3d5dde5f'],
}
```

Tournaments are the core class handling all the betting interactions between your players. Your server will create a new `Tournament` for each betting interaction between the players in your game. Once a `Tournament` has been created, your users will be able to buy in to the `Tournament`. After your users have finished battling it out in your game, your server will report who won. Arbiter will then charge a transacaction fee (some for us, and some for you) and then release the remaining funds in the `Tournament` to the winning user's Arbiter `Wallet`.


## RESTful

The Arbiter API follows RESTful patterns, returns consistent JSON structures in every response, and relies on built in HTTP features. As long as you are familiar with the standard HTTP features, the API should behave straight forward.

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

The initialize call should be made at the beginning of every user's session in your game. Arbiter creates an anonymous session with the user. The session is managed through the `token` returned in the first response.

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

## Wallet details

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
        'users': ['d8b50f95c8a24f24a7c64c9d3d5dde5f'],
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
users | array | The User IDs of users who have successfully placed a bought in to this tournament.

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
            'users': ['d8b50f95c8a24f24a7c64c9d3d5dde5f'],
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
        'users': ['d8b50f95c8a24f24a7c64c9d3d5dde5f']
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
users | array | The User IDs of users who have successfully placed a bet in this tournament.

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
            'users': ['d8b50f95c8a24f24a7c64c9d3d5dde5f']
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
users | array | The User IDs of users who have successfully placed a bet in this tournament.

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
        'users': ['d8b50f95c8a24f24a7c64c9d3d5dde5f', 'efc4654a2b9844589a8d77d09628afbf'],
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
users | array | The user IDs of users who have successfully placed a bought in to this tournament.

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
        'users': ['d8b50f95c8a24f24a7c64c9d3d5dde5f', 'efc4654a2b9844589a8d77d09628afbf'],
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
users | array | The user IDs of users who have successfully bought in to this tournament.

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
    'users': ['d8b50f95c8a24f24a7c64c9d3d5dde5f', 'efc4654a2b9844589a8d77d09628afbf'],
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

# Unity SDK

[Download the SDK](https://github.com/andyzinsser/arbiter-ios-sdk-example)

## Initialize

```csharp
Arbiter.Initialize( GAME_API_KEY, CallbackFunction );
```

## Agree to Terms of Service

```csharp
Arbiter.VerifyUser();
```

## Query User

## Query Wallet

```csharp
Arbiter.QueryWallet();
```

## Deposit
## Request Jackpot
## Place Bet
## Report Score
## Query Jackpot
## Cash Out

