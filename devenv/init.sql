
/* 
Add Postgres initialization here 
Note: this gets run only if postgres data is empty. 
Empty the folder then do docker-compose up
*/

-- Connect to your PostgreSQL database as a superuser or a user with sufficient privileges.

-- Create the database
CREATE DATABASE kraimerdb;

-- Create the user
CREATE USER kraimerdbuser WITH PASSWORD 'kraimerdbpass';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE kraimerdb TO kraimerdbuser;

