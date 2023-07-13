To use this: (To demonstrate this use POSTMAN)
(first install nodemon)
first use command "nodemon judge0.js" this will start the local server

then use following URLS in postman

1) First to register the user ("localhost:3000/register") (Choose POST method)
  then in request body , select (json)
  example body:
  {
    "email":"example@gmail.com",
    "password":"1234"
  }

2) Then login the user ("localhost:3000/login")  (Choose POST method)
    example body:  select (json)
  {
    "email":"example@gmail.com",
    "password":"1234"
  }
  you will receive an token in the response object 
  copy that token since it will be required for next steps

3) Then for code submission ("localhost:3000/submissions")  (Choose POST method)
  a) example body:
  Enter raw text( code that you want to run)
  b) in request headers add following headers
  Authorization : Bearer <token>
  Content-Type: text/plain
  c) in params select the code language
    (for java = 62
    for cpp = 53
    for python = 70)
    id:62/53/70

  in response object you will see the code output

4) to check the past submissions ("localhost:3000/submissions") (choose GET method)
  in request headers add following headers
  Authorization : Bearer <token>
  
  
  
