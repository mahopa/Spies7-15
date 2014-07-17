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
SpyApp.Url = "https://testalex2.firebaseio.com";
//Function to make Urls
SpyApp.makeURL = function (baseUrl, arr) {
    if (!baseUrl) {
        baseUrl = SpyApp.Url;
    }
    if (!arr) {
        arr = [];
    }
    return baseUrl + "/" + arr.join("/") + ".json";
};
//Loops through spies and prints them to the page
SpyApp.drawTable = function () {
    var holder = "<table class='table table-hover table-striped'>";
    //Table Header Row
    holder += "<tr>";
    holder += "<th>Name</th><th>Number</th><th>Weapon</th><th>Drink</th><th><i class='fa fa-cog'></i></th>"
    holder += "</tr>"
    //Loop over the spies in the array
    for (var s in SpyApp.spies) {
        if (!SpyApp.spies[s].isAlive) {
            holder += "<tr style='text-decoration:line-through; color:red'>"
        }
        else { holder += "<tr>"; }
        if (!SpyApp.spies[s].isUnderCover) {
            holder += "<td>" + SpyApp['spies'][s]['name'] + "</td>";
            //-----------------SpyApp.spies[s].name
        }
        else {
            holder += "<td>REDACTED</td>";
        }
        holder += "<td>" + SpyApp.spies[s].number + "</td>";
        holder += "<td>" + SpyApp.spies[s].weapon + "</td>";
        holder += "<td>" + SpyApp.spies[s].drink + "</td>";
        holder += "<td> \
            <button class='btn btn-warning' onclick='SpyApp.changeCover("+ s + ")'> \
                <i class='fa fa-search'></i></button> \
            <button class='btn btn-danger' onclick='SpyApp.killSpy("+ s + ")'> \
                  <i class='fa fa-crosshairs'></i></button> \
            <button class='btn btn-info' onclick='SpyApp.startEdit("+ s + ")'>     \
                  <i class='fa fa-edit'></i></button>  \
                  </td>";
        holder += "</tr>";
    }
    holder += "</table>";
    document.getElementById("spy-table").innerHTML = holder;
};
//Start Edit
SpyApp.startEdit = function (index) {
    var editSpy = SpyApp.spies[index];
    document.getElementById("deleteButton").onclick = function () { SpyApp.deleteSpy(index); };
    document.getElementById("saveChanges").onclick = function () { SpyApp.save(index); };
    document.getElementById("modalTitle").innerHTML = editSpy.name;
    document.getElementById("editName").value = editSpy.name;
    document.getElementById("editNumber").value = editSpy.number;
    document.getElementById("editDrink").value = editSpy.drink;
    document.getElementById("editWeapon").value = editSpy.weapon;
    $("#modal").modal();
};

//Gets a value from an input and clears the input
SpyApp.getAndClear = function (/*Array of element id strings*/ input) {
    holder = {};
    for (var i in input) {
        holder[input[i]] = document.getElementById(input[i]).value;
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
SpyApp.Ajax = function (verb, url, success, failure, data) {
    var xhr = new XMLHttpRequest();
    xhr.open(verb, url);
    xhr.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            console.log("Success");
            var response = JSON.parse(this.response);
            if (typeof success === "function") { success(response); }
        }
        else {
            console.log("Failure");
            if (typeof failure === "function") { failure(this.status + ":" + this.response) }
        }
    };
    xhr.onerror = function () {
        console.log("Comm Error");
        if (typeof failure === "function") { failure("Comm Error") }
    };
    xhr.send(JSON.stringify(data));
};
SpyApp.save = function (i) {
    var editingSpy = SpyApp.spies[i];
    var editedSpy = new SpyApp.Spy();
    editedSpy.name = document.getElementById("editName").value;
    editedSpy.drink = document.getElementById("editDrink").value;
    editedSpy.weapon = document.getElementById("editWeapon").value;
    editedSpy.number = document.getElementById("editNumber").value;
    SpyApp.Ajax("PATCH",
        SpyApp.makeURL(
        null,
        [editingSpy.firebaseId]),
        function () {
            SpyApp.spies[i] = editedSpy;
            SpyApp.drawTable();
        },
        function () {
            alert("Please try again!");
        },
        editedSpy
        );
    $("#modal").modal("hide");
};
SpyApp.deleteSpy = function (i) {
    var deadSpy = SpyApp.spies[i];
    $("#modal").modal('hide');
    SpyApp.Ajax("DELETE", SpyApp.makeURL(null, [deadSpy.firebaseId]),
        function () {
            SpyApp.spies.splice(i, 1);
            SpyApp.drawTable();
        },
        function () {
            alert("Delete function failed...Please try again!");
        }
        );
};
SpyApp.sendToFirebase = function (spy) {
    SpyApp.Ajax(
        "Post",
        SpyApp.makeURL(),
        function (data) { //Success Callback Function
            spy.firebaseId = data.name;
            SpyApp.spies.unshift(spy);
            SpyApp.drawTable();
        },
        alert,//Failure
        spy //Sends the spy as the data
        );
};
//Gets all spies from firebase
SpyApp.getAllFromFirebase = function () {
    SpyApp.Ajax(
        "GET",
        SpyApp.makeURL(),
        //Success Callback
        function (rdata/*this is response when the ajax hands it in*/) {
            for (var s in rdata) {
                //push each spy into my array
                //Sets the prototype of each spy from firebase to share the prototype of our spys
                rdata[s].__proto__ = SpyApp.Spy.prototype;
                rdata[s].firebaseId = s;
                SpyApp.spies.push(rdata[s]);
            }
            SpyApp.drawTable();
        },
        alert, //Failure Callback
        null //No data sent in
        );
};
//-----------
//Direct Calls to Functions
//------------
//Seeding
SpyApp.getAllFromFirebase();
//Line 148 total