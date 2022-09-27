## Hey je suis sur la branche dev

## Remember
psql setup on school mac

brew install postgresql
brew services start postgresql
psql postgres
create database mydb;
create user myuser with password 'mypass';
grant all privileges on database mydb to myuser;