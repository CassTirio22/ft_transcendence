## Hey je suis sur la branche dev

## Remember
`psql setup on school mac`  

`brew install postgresql`  
`brew services start postgresql`  
`psql postgres`  
`create database mydb`  
`create user myuser with password 'mypass'`  
`grant all privileges on database mydb to myuser`  
  
## Create an html documentation  
Go into the client/server folder and use command line :   
`npx typedoc --tsconfig tsconfig.json`   
A folder docs/ will be created/modified and index.html is inside.