//Spy App namespacing object
var SpyApp = {};
//Array to hold all the spies
SpyApp.spies = [];
//--------
//Function Definitions
//--------
//Creates Spy Objects
SpyApp.Spy = function (name, number, weapon, drink) {
    this.name = name;
    this.number = number;
    this.weapon = weapon;
    this.drink = drink;
};
//Set Prototype Properties
//Must come after constructor is defined
SpyApp.Spy.prototype.isUnderCover = true;
SpyApp.Spy.prototype.isAlive = true;
//Loops through spies and prints them to the page
SpyApp.drawTable = function () {
    var holder = "<table class='table table-hover table-striped'>";
    //Table Header Row
    holder += "<tr>";
    holder +="<th>Name</th><th>Number</th><th>Weapon</th><th>Drink</th><th><i class='fa fa-cog'></i></th>"
    holder += "</tr>"
    //Loop over the spies in the array
    for (var s in SpyApp.spies) {
        if (!SpyApp.spies[s].isAlive) {
            holder += "<tr style='text-decoration:line-through; color:red'>"
        }
        else { holder += "<tr>"; }
        if(!SpyApp.spies[s].isUnderCover){
        holder += "<td>" + SpyApp['spies'][s]['name'] + "</td>";
        //-----------------SpyApp.spies[s].name
        }
        else{
            holder += "<td>REDACTED</td>";
        }
        holder += "<td>"+SpyApp.spies[s].number+"</td>";
        holder += "<td>"+SpyApp.spies[s].weapon+"</td>";
        holder += "<td>"+SpyApp.spies[s].drink+"</td>";
        holder += "<td> \
            <button class='btn btn-warning' onclick='SpyApp.changeCover("+s+")'> \
                <i class='fa fa-search'></i></button> \
            <button class='btn btn-danger' onclick='SpyApp.killSpy("+s+")'> \
                  <i class='fa fa-crosshairs'></i></button></td>";
        holder += "</tr>";
    }
    holder += "</table>";
    document.getElementById("spy-table").innerHTML = holder;
};
//Gets a value from an input and clears the input
SpyApp.getAndClear = function (/*Array of element id strings*/ input) {
    holder = {};
    for (var i in input) {
        holder[input[i]]= document.getElementById(input[i]).value;
        document.getElementById(input[i]).value = "";
    }
    return holder;
};
//Creates new Spies and adds them to the array
SpyApp.addSpy = function () {
    var h = SpyApp.getAndClear(["name", "number", "weapon", "drink"]);
    //Calls our Post Ajax function to send the spy to firebase
   SpyApp.sendToFirebase(new SpyApp.Spy(h.name, h.number, h.weapon, h.drink));
};
//Sets a spy to dead
SpyApp.killSpy = function (target) {
    //No toggle...You only live once
    SpyApp.spies[target].isAlive = false;
    SpyApp.drawTable();
};
//Toggles a Spy's cover status
SpyApp.changeCover = function (i) {
    if (SpyApp.spies[i].isUnderCover) {
        SpyApp.spies[i].isUnderCover = false;
    }
    else {
        SpyApp.spies[i].isUnderCover = true;
    }
    SpyApp.drawTable();
};
SpyApp.sendToFirebase = function (spy) {
    //Creates Request Object
    var request = new XMLHttpRequest();
    //Open the request
    request.open("POST", "https://testalex2.firebaseio.com/.json", true);
    //Error -> No response from server
    request.onerror = function () {
        console.log("Communication error");
    };
    //If the server responds
    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            //success--> Do the table thing here
            SpyApp.spies.unshift(spy);
            SpyApp.drawTable();
        }
        else {
            //error --> Don't add spy to table
            alert("There was an error, please try again!");
        }
    };
    //Send the request to Firebase
    request.send(JSON.stringify(spy));

};
SpyApp.getAllFromFirebase = function () {
    var request = new XMLHttpRequest();
    request.open("GET", "https://testalex2.firebaseio.com/.json");
    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            //Parse object that returned from firebase
            var data = JSON.parse(this.response);
            //loop over object from firebase and pull out each spy
            for (var s in data) {
                //push each spy into my array
                alert(s);
                //Sets the prototype of each spy from firebase to share the prototype of our spys
                data[s].__proto__ = SpyApp.Spy.prototype;
                SpyApp.spies.push(data[s]);
            }
            SpyApp.drawTable();
        }
        else {
            alert(this.response);
        }
    };
    request.onerror = function () {
        console.log("ERRRRRR");
    };
    request.send();
};
//-----------
//Direct Calls to Functions
//------------

//Seeding
SpyApp.getAllFromFirebase();