const URL = 'https://my-json-server.typicode.com/codeedu2020/api/';


document.querySelector("#pretraga").addEventListener("keyup", filterChange);
document.querySelector("#rang").addEventListener("change", filterChange);
document.querySelector("#sort").addEventListener("change", filterChange);
document.querySelector("#reset").addEventListener("click", reset);
let states = document.querySelectorAll(".stanje");
states.forEach(elem => {

    elem.addEventListener("change", filterChange)
});




function filterChange() {


    getData("knjige", renderBooks);


}



//preuzimannje

function getData(endpoint, callback) {


    fetch(URL + endpoint).
        then(res => res.json()).
        then(res => {

            callback(res);

        }).
        catch(e => console.log(e))
}







function init() {

    getData("pisci", renderWriter);
    getData("zanrovi", rednerGenre);
    getData("knjige", renderBooks);
}





let pagaIndex = 0;
let itemsPerPage = 3;
localStorage.setItem("perPage", JSON.stringify({ per: itemsPerPage }));
function renderBooks(data) {

    data = filterWriter(data);
    data = filterGenre(data);
    data = filterPrice(data);
    data = filterState(data);
    data = filterSearch(data);
    data = sortPrice(data);

    countData(data);
    countDataGenres(data);

    let html = '';


    if (data.length == 0) {

        html = `<p class="text-danger">Nema rezultata pretrage</p>`;
    } else {

        for (let i = pagaIndex * itemsPerPage; i < (pagaIndex * itemsPerPage) + itemsPerPage; i++) {

            if (!data[i]) { break; }

            html += `<div class="col-lg-4 col-md-6 mb-4">
    
    <div class="card h-100">
    <img src='./assets/img/${data[i].slika.src}' alt='./assets/img/${data[i].slika.alt}' class="card-img-top">
    <div class="card-body">
    
    <h3 class="card-title">${data[i].naslov}</h3>
    <p class="card-text">${getWriter(data[i].pisacID)}</p>
    <p class="card-text">${getGenres(data[i].zanrovi)}</p>
    <p class="card-text ${data[i].naStanju ? 'text-success' : 'text-danger'}">
    ${data[i].naStanju ? "In stock" : "Out of stock"}
    </p>
    <p class="card-text text-decoration-line-through text-secondary"><s>Old price: ${data[i].price.staraCena}EUR</s></p>
    <p class="card-text text-primary">New price: ${data[i].price.novaCena}EUR</p>
    <div class="text-center">
    <button  class="btn btn-primary cart"  data-id="${data[i].id}">Add to cart</button>
    </div>
    </div>
    </div>
    </div>
`
        }
    }

    document.querySelector("#knjige").innerHTML = html;
    loadPageNumber(data);

    let buttons = document.querySelectorAll(".cart");

    buttons.forEach(elem => {
        elem.addEventListener("click", addtoCart);
    })


}


function renderWriter(data) {

    sessionStorage.setItem("pisci", JSON.stringify(data));

    const writer = document.querySelector("#pisci");


    let html = ``;

    data.forEach(element => {

        html += `<li class="list-group-item">
    <input type="checkbox" value="${element.id}" class="pisac" name="pisci"/><span>${element.ime} ${element.prezime}</span> 
    <span id="countWriter${element.id}" class="writer"></span>
 </li>`;


    });


    writer.innerHTML = html;

    let writers = document.querySelectorAll(".pisac");

    writers.forEach(elem => {


        elem.addEventListener("change", filterChange);
    })



}


function getGenres(array) {


    let genres = JSON.parse(sessionStorage.getItem("zanrovi"));

    let html = "";

    let newGenre = genres.filter(elem => array.includes(elem.id));


    newGenre.forEach((elem, i) => {

        html += elem.naziv;
        if (newGenre.length - 1 != i) {

            html += ', ';

        }
    })

    return html;


}


function getWriter(id) {


    let writers = JSON.parse(sessionStorage.getItem("pisci"));


    let obj = writers.filter(elem => elem.id == id)[0];


    return obj.ime + " " + obj.prezime;



}

function rednerGenre(data) {

    sessionStorage.setItem("zanrovi", JSON.stringify(data));

    const genre = document.querySelector("#zanrovi");

    let html = '';



    data.forEach(element => {

        html += `<li class="list-group-item">
        <input type="checkbox" value="${element.id}" class="zanr" name="zanrovi"/> <span>${element.naziv}</span>
        <span id="countGenre${element.id}" class="genre"></span>
    
     </li>`
    });

    genre.innerHTML = html;

    let genres = document.querySelectorAll(".zanr");

    genres.forEach(elem => {


        elem.addEventListener("change", filterChange);
    })

}



init();


//filteri


function filterSearch(data) {

    let word = document.querySelector("#pretraga").value;

    if (word) {


        return data.filter(elem => elem.naslov.toLowerCase().indexOf(word.trim().toLowerCase()) > -1)

    }

    return data;

}

function filterPrice(data) {


    let price = document.querySelector("#rang").value;

    document.querySelector("#rez").textContent = price + " EUR";


    return data.filter(elem => parseInt(elem.price.novaCena) <= parseInt(price));


}


function filterState(data) {


    let radio = document.querySelector(".stanje:checked");

    if (radio.value == "dostupno") {

        return data.filter(elem => elem.naStanju)
    } else if (radio.value == "nedostupno") {
        return data.filter(elem => !elem.naStanju)
    } else {

        return data;
    }



}

function filterGenre(data) {  //niz  knjiga       zanrovi:[5,4,3]

    let cheks = document.querySelectorAll(".zanr");

    let array = []

    cheks.forEach(elem => {


        if (elem.checked) {

            array.push(parseInt(elem.value));

        }
    })

    if (array.length > 0) {


        return data.filter(elem => elem.zanrovi.some(el => array.includes(el)));

    } else {

        return data;

    }






}


function filterWriter(data) {

    let cheks = document.querySelectorAll(".pisac");

    let array = []

    cheks.forEach(elem => {


        if (elem.checked) {

            array.push(parseInt(elem.value));

        }
    })

    if (array.length > 0) {


        return data.filter(elem => array.includes(parseInt(elem.pisacID)));

    } else {

        return data;

    }

}

function sortPrice(data) {

    let method = document.querySelector("#sort").value;

    if (method == "asc") {

        return data.sort((a, b) => {


            if (parseInt(a.price.novaCena) > parseInt(b.price.novaCena)) {
                return 1;
            }

            if (parseInt(a.price.novaCena) < parseInt(b.price.novaCena)) {
                return -1;
            }

            if (parseInt(a.price.novaCena) == parseInt(b.price.novaCena)) {
                return 0;
            }

        })


    }
    else if (method == "desc") {

        return data.sort((a, b) => {


            if (parseInt(a.price.novaCena) < parseInt(b.price.novaCena)) {
                return 1;
            }

            if (parseInt(a.price.novaCena) > parseInt(b.price.novaCena)) {
                return -1;
            }

            if (parseInt(a.price.novaCena) == parseInt(b.price.novaCena)) {
                return 0;
            }

        })


    } else {

        return data;
    }





}

//resetovanje svih filtera

function reset() {


    let checkcZ = document.querySelectorAll(".zanr");

    checkcZ.forEach(elem => {

        elem.checked = false;
    })


    let checkcP = document.querySelectorAll(".pisac");

    checkcP.forEach(elem => {

        elem.checked = false;
    })



    document.querySelector("#pretraga").value = "";
    document.querySelector("#sort").selectedIndex = 0;
    let states = document.querySelectorAll(".stanje");
    states.forEach(elem => {


        if (elem.value == "sve") {

            elem.checked = true;
        }

    })
    document.querySelector("#rang").value = 1000;
    document.querySelector("#rez").textContent = "";

    filterChange();
}


//paginacija


function loadPageNumber(data) {

    const pagW = document.querySelector("#pageNum");
    pagW.innerHTML = ``;

    let paraf = document.createElement("p");
    let write = `<select>`;

    for (let i = 1; i <= data.length; i++) {

        if (i == itemsPerPage) {
            write += `<option value="${i}" selected>${i}</option>`;
        } else {
            write += `<option value="${i}">${i}</option>`;
        }
    }
    write += `</select>`;
    paraf.innerHTML = write;
    pagW.appendChild(paraf);

    paraf.querySelector("select").addEventListener("change", function (e) {

        itemsPerPage = parseInt(e.target.value);
        localStorage.setItem("perPage", JSON.stringify({ per: e.target.value }));
        getData("knjige", renderBooks);

    })

    let paraf2 = document.createElement("p");
    paraf2.innerHTML = "First";
    pagW.appendChild(paraf2);

    paraf2.addEventListener("click", function (e) {

        pagaIndex = 0;
        getData("knjige", renderBooks);

    })

    for (let i = 0; i < Math.ceil(data.length / itemsPerPage); i++) {


        let p = document.createElement("p");
        p.innerHTML = i + 1;
        p.addEventListener("click", function (e) {

            pagaIndex = parseInt(e.target.textContent) - 1;
            getData("knjige", renderBooks);
        })

        if (i == pagaIndex) {
            p.style.fontSize = "2rem";
        }
        pagW.appendChild(p);

    }

    let paraf3 = document.createElement("p");
    paraf3.innerHTML = "Last";
    pagW.appendChild(paraf3);

    paraf3.addEventListener("click", function (e) {

        pagaIndex = Math.ceil(data.length / itemsPerPage) - 1;
        getData("knjige", renderBooks);

    })


}

//count

function countData(data) {

    let writers = document.querySelectorAll(".writer");

    writers.forEach(elem => {
        elem.textContent = "(0)";
    })

    let counter = {};

    let arr = data.map(elem => elem.pisacID);    //[1,1,2,3,2,1,2,3]   


    for (el of arr) {

        if (counter[el]) {
            counter[el] += 1;
        } else {
            counter[el] = 1;
        }
    }

    for (let key in counter) {

        document.querySelector(`#countWriter${key}`).innerHTML = `(${counter[key]})`;
    }


}


function countDataGenres(data) {

    let genres = document.querySelectorAll(".genre");

    genres.forEach(elem => {


        elem.textContent = "(0)";
    })

    let counter = {};
  


    for (let book of data) {
        for (let genreID of book.zanrovi) {
            if (counter[genreID]) {
                counter[genreID] += 1;
            } else {
                counter[genreID] = 1;
            }

        }
        
    }

    for (let key in counter) {

        document.querySelector(`#countGenre${key}`).innerHTML = `(${counter[key]})`;

    }
}


async function addtoCart() {


    let id = this.dataset.id;

    let chekc = await fetch("https://my-json-server.typicode.com/codeedu2020/api/knjige/" + id);
    let rez = await chekc.json();


    let cart = [];

    const cookiCart = document.cookie.split("; ").find(row => row.startsWith("cart="));

    if (cookiCart) {

        cart = JSON.parse(cookiCart.split("=")[1])
    }

    if (cart.some(elem => elem.id == id)) {

        cart.find(elem => elem.id == id).quantity++;
    } else {

        cart.push({ id: id, quantity: 1, naslov: rez.naslov, cena: rez.price.novaCena });
    }

    setCookie("cart", JSON.stringify(cart), 5);
    checkCart();


}


function setCookie(name, data, exp) {


    let date = new Date();

    date.setMonth(date.getMonth() + exp);

    document.cookie = name + "=" + data + "; expires=" + date.toUTCString();



}


function checkCart() {



    let basket = document.querySelector("#korpa");

    const cookieCart = document.cookie.split("; ").find(row => row.startsWith("cart="));
    let html = '';

    if (cookieCart) {


        html += `<ul class="list-group">`;

        let cart = JSON.parse(cookieCart.split("=")[1]);
        let suma = 0;


        cart.forEach(elem => {

            suma = suma + elem.quantity * elem.cena;
            html += `<li class="list-group-item">${elem.naslov} <input type="number" class="cart-inp ccc" value="${elem.quantity}" data-id="${elem.id}">
            <span>${elem.cena * elem.quantity}EUR</span><button class="btn btn-danger delete" data-id=${elem.id}>x</button></li> 
            `        })

        if (cart.length > 0) {
            html += `</ul> <div class="total"> Total: ${suma}EUR</div>`
        }
        basket.innerHTML = html;



        document.querySelectorAll(".ccc").forEach(elem => {

            elem.addEventListener("change", changeQuantity);
        })


        document.querySelectorAll(".delete").forEach(elem => {

            elem.addEventListener("click", function () {

                deleteItem(0, this);
            });
        })


    } else {

        basket.innerHTML = "No books in cart!"
    }
}

checkCart();

function changeQuantity() {

    let id = parseInt(this.dataset.id);
    const cookiCart = document.cookie.split("; ").find(row => row.startsWith("cart="));
    let cart = [];


    if (cookiCart) {

        cart = JSON.parse(cookiCart.split("=")[1])


        if (cart.find(elem => elem.id == id).quantity > 0) {

            cart.find(elem => elem.id == id).quantity = this.value;
            setCookie("cart", JSON.stringify(cart), 5);

            checkCart();
        }


        if (this.value <= 0) {

            deleteItem(id);
        }



    }
}

function deleteItem(idk, self) {

    let id;

    if (idk != 0) {

        id = idk;
    } else {

        id = parseInt(self.dataset.id);
    }
    const cookiCart = document.cookie.split("; ").find(row => row.startsWith("cart="));
    let cart = [];

    if (cookiCart) {
        alert("Obrisano iz korpe")
        cart = JSON.parse(cookiCart.split("=")[1]);

        cart = cart.filter(elem => elem.id != parseInt(id));
        setCookie("cart", JSON.stringify(cart), 5);
        checkCart();
    }




}


