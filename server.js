var http = require('http');
var url = require('url');
var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var date = new Date();

var app = express();

var username;
var password;
var isLoggedin=false;

/*****MYSQL DB ADMİN BİLGİLERİ*****/
var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "123456",
    database: "todocrmapp",
    timeout:"100ms"
});

/*****MYSQL DB ADMİN BİLGİLERİ*****/
con.connect(function (err) {

    var server = http.createServer (function (request, response) {

        var q = url.parse(request.url, true);
        var filename = "."+q.pathname;
        console.log("pathname: "+q.pathname);

        /*       LOGIN PROCESS DB     */
        if(q.pathname==="/ToDoCRMApp/signup"){

            username = q.query.uname;
            password = q.query.upass;
            var query = "SELECT * FROM usertable WHERE username='"+username+"' AND password='"+password+"'";

            con.query(query, function (err, result, fields) {
                if (err){
                    throw err;
                }

                console.log(result);

                if (result==""){
                    /*LOGIN FAILED*/
                    console.log("login hatalı");

                    isLoggedin=false;

                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write("false");
                    return response.end();

                }else if(username==result[0].username){

                    /*LOGIN SUCCESSFUL*/
                    console.log("true");
                    isLoggedin=true;
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write("true");
                    return response.end();
                }
            });

        }

        /*          LOGIN PAGE LOAD           */
        else if(q.pathname==="/ToDoCRMApp/login"){

            filename = "login.html";

            fs.readFile(filename, function (err, data) {

                if (err) {
                    response.writeHead(404, {'Content-Type': 'text/html'});
                    response.write("hata");
                    return response.end();
                } else {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    console.log("girdik");
                    response.write(data);
                    return response.end();
                }

            });
        }

        /*      LOGOUT    */
        else if(q.pathname==="/ToDoCRMApp/logout"){

            isLoggedin=false;
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write("logout");
            return response.end();

        }

        /*       INDEX PAGE LOAD       */
        else if(q.pathname == "/" || q.pathname == ""  || q.pathname=="./" || q.pathname == "/ToDoCRMApp/index.html"){

            if(isLoggedin) {
                filename = "./index.html";

                fs.readFile(filename, function (err, data) {

                    if (err) {

                        response.writeHead(404, {'Content-Type': 'text/html'});
                        return response.end();

                    } else {
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.write(data);
                        return response.end();
                    }

                });
            }else{
                filename = "./login.html";

                fs.readFile(filename, function (err, data) {

                    if (err) {
                        response.writeHead(404, {'Content-Type': 'text/html'});
                        return response.end();
                    } else {
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.write(data);
                        return response.end();
                    }

                });
            }
        }

        /*       REGISTER PAGE LOAD       */
        else if(q.pathname == "/ToDoCRMApp/register.html"){
            filename = "./register.html";

            fs.readFile(filename, function (err, data) {

                if (err) {
                    response.writeHead(404, {'Content-Type': 'text/html'});
                    return response.end();
                } else {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write(data);
                    return response.end();
                }

            });
        }

        /*       REGISTER PROCESS DB       */
        else if(q.pathname == "/ToDoCRMApp/signin"){

            console.log("register");
            regname = q.query.name;
            regsurname = q.query.surname;
            regusername = q.query.uname;
            regpassword = q.query.pass;
            regemail = q.query.email;

            var registercomplete = false;

            console.log("register "+regname+" " + regsurname+" " + regpassword + " "+ regusername +" "+ regemail);

            var query = "INSERT INTO usertable (username,password,name,surname,email) " +
                "VALUES ('"+regusername+"','"+regpassword+"','"+regname+"','"+regsurname+"','"+regemail+"') ";

            con.query(query, function (err, result) {

                if (err){
                    registercomplete=false;
                }else{
                    console.log("1 row affected.");
                    registercomplete = true;
                }

                if(registercomplete){
                    /*REGISTER SUCCESSFUL*/
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write("true");
                    return response.end();
                }else{
                    /*   REGISTER FAILED   */
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write("false");
                    return response.end();
                }

            });

        }

        /*      HOMEPAGE PROCESS DB    */
        else if (q.pathname==="/ToDoCRMApp/home"){

            if (isLoggedin) {
                var username = q.query.uname;
                console.log(username);
                var query = "SELECT * FROM usertable WHERE username='" + username + "'";

                con.query(query, function (err, result, fields) {
                    if (err) {
                        throw err;
                    }

                    if (result == "") {
                        /*404 ERROR*/
                        console.log("username hatalı");

                        response.writeHead(404, {'Content-Type': 'text/html'});
                        response.write("false");
                        return response.end();

                    } else if (username == result[0].username) {

                        var obj = result[0];
                        var json = JSON.stringify(obj);

                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.write(json);
                        return response.end();
                    }
                });
            }else{
                filename = "./login.html";
                isLoggedin=false;

                fs.readFile(filename, function (err, data) {

                    if (err) {
                        response.writeHead(404, {'Content-Type': 'text/html'});
                        return response.end();
                    } else {
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.write(data);
                        return response.end();
                    }
                });
            }
        }

        /*   GET TABLE VALUES BY USERNAME   */
        else if(q.pathname==="/ToDoCRMApp/gettask"){

            var username = q.query.uname;

            console.log("get data table: "+username);

            var query = "SELECT * FROM tasktable t, customertable c WHERE c.taxno = t.customerid and t.employeid='"+username+"'";

            con.query(query,function (err, result) {
                if(err){
                    throw err;
                }

                if (result.toString()!=="") {
                    if (username === result[0].employeid) {
                        var obj = result;
                        var json = JSON.stringify(obj);

                        console.log(obj);

                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.write(json);
                        return response.end();
                    }
                }
                else {/*EMPTY TASK RETURNED*/
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write("empty");
                    return response.end();
                }
            });

        }

        /*    GET TABLE VALUES WILL BE UPDATED HERE      */
        else if (q.pathname === "/ToDoCRMApp/updatetable"){

            var body=[];
            var parsed;

            request.on('data', function (chunk) {

                body.push(chunk);

            }).on('end', function () {
                body = Buffer.concat(body).toString();
                if(body){

                    parsed = JSON.parse(body);  /* DATA SENT FROM UPDATETABLE WILL BE UPDATED BELOW*/

                    var today = date.getDate()+"."+date.getMonth()+"."+date.getFullYear();

                    /*DB QUERY*/
                    var query = "UPDATE tasktable SET status = '"+parsed.status+"', offernr = '"+parsed.offernr+"', " +
                        " proformanr='"+parsed.proformanr+"',`update` ='"+today+"', description='"+parsed.description+"' " +
                        "WHERE (taskid = '"+parsed.taskid+"')";


                    con.query(query, function (err, result) {

                        if (err){
                            response.writeHead(510, {'Content-Type': 'text/html'});
                            response.write("false");//update unsuccessful
                            return response.end();
                            throw err;
                        }


                    });
                }

                response.writeHead(200, {'Content-Type': 'text/html'});
                response.write("true");//update successfull
                return response.end();
            });

        }

        /*      REGISTER NEW TO-DO TASK         */
        else if(q.pathname === "/ToDoCRMApp/registertask"){

            var body=[];
            var parsed;

            request.on('data', function (chunk) {

                body.push(chunk);

            }).on('end', function () {
                body = Buffer.concat(body).toString();

                if(body){
                    parsed = JSON.parse(body);  /* DATA SENT FROM REGISTER TABLE WILL BE REGISTERED BELOW*/
                    var today = date.getDate()+"."+date.getMonth()+"."+date.getFullYear();

                    console.log(parsed);

                    /*DB QUERY*/
                    var query = "INSERT INTO tasktable " +
                        "(`customerid`, `startdate`, `update`, `tasktype`, `description`, `status`, `employeid`, " +
                        "`offernr`, `proformanr`) VALUES ('"+parsed.taxno+"', '"+today+"', '"+today+"', 'n/a', '"+parsed.description+"', " +
                        "'notstarted', '"+parsed.employeid+"', 'notassigned', 'notassigned')";


                    con.query(query, function (err, result) {

                        if (err){
                            response.writeHead(510, {'Content-Type': 'text/html'});
                            response.write("false");    //REGISTER unsuccessful
                            return response.end();
                            throw err;
                        }

                    });
                }

                response.writeHead(200, {'Content-Type': 'text/html'});
                response.write("true"); //YENİ GÖREV EKLENDİ
                return response.end();
            });

        }

        /*      GET CUSTOMER LIST         */
        else if (q.pathname==="/ToDoCRMApp/getcustomerlist"){

            console.log("all clients");
            var query = "SELECT * FROM customertable";

            con.query(query, function (err, result) {

                if (err){
                    response.writeHead(510, {'Content-Type': 'text/html'});
                    response.write("false");    //Customer List cannot GET from database
                    return response.end();
                    throw err;
                }

                var obj = result
                var json = JSON.stringify(obj);

                response.writeHead(200, {'Content-Type': 'text/html'});
                response.write(json);
                return response.end();

            });

        }

        /*      REGISTER NEW CUSTOMER       */
        else if (q.pathname === "/ToDoCRMApp/registernewcustomer"){

            var body=[];
            var parsed;

            request.on('data', function (chunk) {

                body.push(chunk);

            }).on('end', function () {
                body = Buffer.concat(body).toString();

                if(body){
                    parsed = JSON.parse(body);  /* DATA SENT FROM REGISTER CUSTOMER WILL BE REGISTERED BELOW*/

                    console.log(parsed);

                    /*DB QUERY*/
                    var query = "INSERT INTO customertable (`taxno`, `companyname`, `customername`, " +
                        "`customersurname`, `address`, `email`, `telephone`) VALUES " +
                        "('"+parsed.taxno+"', '"+parsed.companyname+"', '"+parsed.customername+"', '"+parsed.customersurname+"', " +
                        "'"+parsed.address+"', '"+parsed.email+"', '"+parsed.telephone+"')";


                    try {
                        con.query(query, function (err, result) {

                            if (err){
                                response.writeHead(510, {'Content-Type': 'text/html'});
                                response.write("false");    //REGISTER unsuccessful
                                return response.end();
                                throw err;
                            }

                        });
                    }catch (e) {
                        console.log("Error:"+e.toString());
                    }

                }
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.write("true"); //YENİ MÜŞTERİ EKLENDİ
                return response.end();
            });

        }

        /*      UPDATE CUSTOMER    */
        else if (q.pathname === "/ToDoCRMApp/updatecustomer"){

            var body=[];
            var parsed;

            request.on('data', function (chunk) {

                body.push(chunk);

            }).on('end', function () {
                body = Buffer.concat(body).toString();

                if(body){
                    parsed = JSON.parse(body);  /* DATA SENT FROM REGISTER CUSTOMER WILL BE REGISTERED BELOW*/

                    console.log(parsed);

                    /*DB QUERY*/
                    var query = "UPDATE customertable SET `companyname` = '"+parsed.companyname+"', " +
                        "customername ='"+parsed.customername+"', customersurname='"+parsed.customersurname+"'," +
                        "address='"+parsed.address+"', email='"+parsed.email+"', telephone='"+parsed.telephone+"', taxno='"+parsed.newtaxno+"' " +
                        "WHERE (`taxno` = '"+parsed.oldtaxno+"')";

                    try {
                        con.query(query, function (err, result) {

                            if (err){
                                response.writeHead(510, {'Content-Type': 'text/html'});
                                response.write("false");    //UPDATE unsuccessful
                                return response.end();
                                throw err;
                            }

                        });
                    }catch (e) {
                        console.log("Error:"+e.toString());
                    }
                }
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.write("true"); //UPDATE UNSUCCESSFUL
                return response.end();
            });


        }

        /*      UPDATE USER INFO    */

    });

    server.listen(63343, function () {
        console.log((new Date())+'Server listens on port 63342');
    });

});
