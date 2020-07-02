## CHARACTER CREATER API

## API LINK

https://maple-minister-95148.herokuapp.com/

## DOCUMENTATION

* '/api/users/':
    POST: registers/logs in users.

* '/api/characters/' :
    GET: gets a user's characters with all fields with serialization.
    POST: adds a new character linked to the user via user_id.

* '/api/characters/:character_id' :
    GET: gets a specific character for the user with all fields with serialization.
    PATCH: updates a specific character (also used for 'deletion').

* '/api/auth': grants authorization to users so they can fetch their characters.

## SUMMARY

This API was created to help creators have a centralized place to store all their characters and information about them. Included fields are:
  First Name
  Last Name
  Age
  Sex
  Major Trait
  Motivation
  Fear
  History
as of Version 1, with more in the works. All are text.

Required fields are: first_name, last_name, and major_trait.

Authorization is necessary for using the API using JWT, and uses Bearer Token Auth.

## ERRORS

Utilizes standard HTTP respones to indicate success or failure of requests.

## TECH STACK

Node, Express, PostgreSQL, with REST.