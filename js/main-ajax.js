//callback f-ja
function ajaxCB(imeFajla, rezultat){ 
    $.ajax({
        url: "data/" + imeFajla,
        method: "get",
        dataType: "json",
        success: rezultat,
        error: function(xhr, error, status){
            console.log(xhr)  
        }
    });
}

let proizvodi = [];
let proizvodiUKorpi = [];

window.onload = function () {
    if(localStorage.getItem('proizvodUKorpi'))
        proizvodiUKorpi = JSON.parse(localStorage.getItem('proizvodUKorpi'));

    //console.log(proizvodiUKorpi);

    // ispis korpe
    ispisiKorpu();

    //ajax zahtev - meni
    ajaxCB("meni.json", function(rezultat) {
        kreirajMeni(rezultat);
    })

    //ajax zahtev - proizvodi
    ajaxCB("proizvodi.json", function(rezultat) {
        localStorage.setItem("nizProizvoda", JSON.stringify(rezultat));
        ispisProizvoda(rezultat);
    })

    //ajax zahtev - kategorije
    ajaxCB("kategorije.json", function(rezultat) {
        kreirajCheckBoxKat(rezultat);
    })

    //ajax zahtev - sortiranje
    ajaxCB("sortiranje.json", function(rezultat) {
        kreirajPadajucuListu("Sort by", "sortiraj", "#sortiranje", rezultat);
    })

    $(".cart-quantity").html(`(${proizvodiUKorpi.length})`);
    $("#cart-part").click(function() {
        if (proizvodiUKorpi == [])
            prikaziPraznuKorpu();
        else    
            ispisiKorpu(proizvodiUKorpi);
    })
}
function filterChange() {
    ajaxCB("proizvodi.json", ispisProizvoda);
}
   

//f-ja za kreiranje menija
function kreirajMeni(nizMeni){
    let html = 
    `<nav class="classy-navbar justify-content-between" id="alazeaNav">
        <a href="index.html" class="nav-brand"><img src="img/core-img/logo.png" alt="Logo image"></a>
        <div class="classy-navbar-toggler">
            <span class="navbarToggler"><span></span><span></span><span></span></span>
        </div>
        <div class="classy-menu">
            <div class="classycloseIcon">
                <div class="cross-wrap"><span class="top"></span><span class="bottom"></span></div>
            </div>
            <div class="classynav">
                <ul>`;
    
    for(let stavkaMenija of nizMeni){
        html+=`<li><a href="${stavkaMenija.href}">${stavkaMenija.tekst}</a></li>`;
    }
        
    
    $("#meni").html(html);
}
//f-ja za ispis proizvoda
function ispisProizvoda(nizProizvoda) {
    let html = '';
    proizvodi = JSON.parse(localStorage.getItem("nizProizvoda"));
    nizProizvoda = filtrirajPoKategoriji(nizProizvoda);
   
    if(nizProizvoda.length == 0){
        html = `<div class="row">
                    <div class="col-12">
                        <p class="alert alert-danger">Trenutno nema proizvoda.</p>
                    </div>
                </div>`;
    }
    else {
        for(let proizvod of nizProizvoda){
            html += `<div class="col-12 col-sm-6 col-lg-4">
        <div class="single-product-area mb-50">
            <!-- Product Image -->
            <div class="product-img">
                <img src="${proizvod.slika}" alt="${proizvod.naziv}">
                <!-- Product Tag -->
                <div class="product-tag">
                    <a href="#">Hot</a>
                </div>
                <div class="product-meta d-flex">
                    <a href="cart.html" class="add-to-cart-btn" data-id = "${proizvod.id}">Add to cart</a>
                </div>
            </div>
            <!-- Product Info -->
            <div class="product-info mt-15 text-center">
                    <p>${proizvod.naziv}</p>
                <h6>${proizvod.cena}</h6>
            </div>
        </div>
    </div>`;
        }
    }
    $("#proizvodi").html(html);
    $(".add-to-cart-btn").click(function(e) {
        e.preventDefault();
        let id = $(this).data("id");
        dodajUKorpu(id);
    });
}
//f-ja za kreiranje check box - kategorije
function kreirajCheckBoxKat(nizKategorija) {
    let html = '';
    $(document).on("change", ".kategorija", filterChange);
    if(nizKategorija.length == 0){
        html = `<div class="row">
                    <div class="col-12">
                        <p class="alert alert-danger">Trenutno nema proizvoda.</p>
                    </div>
                </div>`;
    }
    else {
        for(let kategorija of nizKategorija){
            html += `<div class="custom-control custom-checkbox d-flex align-items-center mb-2">
            <input type="checkbox" class="custom-control-input kategorija" id="customCheck${kategorija.id}" value="${kategorija.id}">
            <label class="custom-control-label" for="customCheck${kategorija.id}">${kategorija.naziv} <span class="text-muted">(72)</span></label>
        </div>`;
        }
    }
    $("#kategorije").html(html);
}


 // filtriranje po kategoriji
 
 function filtrirajPoKategoriji(nizProizvoda) {
    let oznaceneKategorije = [];

    $(".kategorija:checked").each(function(el) {
        oznaceneKategorije.push(parseInt($(this).val()));
        console.log(oznaceneKategorije);
    });

    if (oznaceneKategorije.length != 0) 
        return nizProizvoda.filter(kategorija => kategorija.idKat.some(x => oznaceneKategorije.includes(x)));
    else 
        return nizProizvoda;
}


// f-ja za kreiranje dinamicke padajuce liste
function kreirajPadajucuListu(labela, id, divIspis, niz){
    let html = `<div class="form-group">
        <label>${labela}</label>
        <select id = "sort" class="custom-select widget-title" id="${id}">
            <option value="0">Select</option>`;
            for(let objekat of niz){
                html += `<option value="${objekat.id}">${objekat.naziv}</option>`
            }
    
    html += `</select>
    </div>`;
  
    $(divIspis).html(html);
}




    $(document).on("change", "#sort", function(){
        let tipSortiranja = $(this).val();

    //console.log(tipSortiranja)
    var proizvodi = JSON.parse(localStorage.getItem("nizProizvoda"));
    //console.log(proizvodi)
    
    proizvodi.sort(function(a, b){
        // cena rastuce
        if(tipSortiranja == 1)
            return a.cena - b.cena;

        // cena opadajuce
        if(tipSortiranja == 2)
           return b.cena - a.cena;

        // naziv rastuce
        if(tipSortiranja == 3){
            if(a.naziv < b.naziv){
                return -1;
            }
            else if(a.naziv > b.naziv){
                return 1;
            }
            else{
                return 0;
            }
        }

        // naziv opadajuce
        if(tipSortiranja == 4){
            if(a.naziv > b.naziv){
                return -1;
            }
            else if(a.naziv < b.naziv){
                return 1;
            }
            else{
                return 0;
            }
        }
    })

    ispisProizvoda(proizvodi);
    
})
//FORMA
var inputi = [
    {
        "type": "text",
        "id": "contact-name",
        "placeholder": "Your name",
        "pId" : "1"
    },
    {
        "type": "email",
        "id": "contact-email",
        "placeholder": "Your Email",
        "pId" : "2"
    },
    {
        "type": "text",
        "id": "contact-subject",
        "placeholder": "Subject",
        "pId" : "3"
    }
];
var lista = [
    {
        "value": 0,
        "text": "Choose country"
    },
    {
        "value": 1,
        "text": "New York"
    },
    {
        "value": 2,
        "text": "France"
    },
    {
        "value": 3,
        "text": "England"
    },
    {
        "value": 4,
        "text": "Serbia"
    },
];

var poruka = {
    "name": "message",
    "id": "message",
    "cols": "30",
    "rows": "10",
    "placeholder": "Message",
    "pId" : "poruka"
};
var taster = {
    "id" : "tasterKlik",
    "type": "button",
    "class": "btn alazea-btn mt-15",
    "text": "Send Message"
};

ispisForme(inputi, poruka, lista, taster);
//ispis forme
function ispisForme(inputi, poruka, lista, taster){
    var divIspisForme = document.getElementById("forma");
    let html = '';
    for(let i of inputi){
        html += `<div class="col-12 col-md-6">
        <div class="form-group">
            <input type="${i.type}" class="form-control" id="${i.id}" placeholder="${i.placeholder}" />
            <p id="${i.pId}"></p>
        </div>
    </div>`;
    //console.log(html);
    }
    html += `<div id = "contact-country" class = "col-12 col-md-6">
    <select name = "drzava" id = "drzava" class = "form-control">`;
    for(let l of lista){
        html+=`<option value = ${l.value}>${l.text}</option>`
    }
    html += `</select><p id="opcija"></p>
    </div>
    <div class="col-12">
        <div class="form-group">
            <textarea class="form-control" name="${poruka.name}" id="${poruka.id}" cols="${poruka.cols}" rows="${poruka.rows}" placeholder="${poruka.placeholder}" /></textarea> 
            <p id="${poruka.pId}"></p>
        </div>
    </div>
    <div class="col-12">
        <button type="${taster.type}" class="${taster.class}" id= "${taster.id}">${taster.text}</button>
    </div>`;
    $(divIspisForme).html(html);
}
var taster0 = document.getElementById('tasterKlik');
$("#tasterKlik").on("click", validacijaForme);

//VALIDACIJA FORME
function validacijaForme() {
    console.log("Zdravo!");
    let kontaktForma = document.getElementById("forma");
    let imePrezime = document.getElementById("contact-name");
    let vrednostImena = imePrezime.value;
    let mejl = document.getElementById("contact-email");
    let vrednostMejl = mejl.value;
    let naslov = document.getElementById("contact-subject");
    let vrednostNaslov = naslov.value;
    let drzava = document.getElementById("country");
    let poruka = document.getElementById("message");
    let vrednostPoruka = poruka.value;

    // Ime i prezime

    let regExIme = /^[A-ZČĆŠĐŽ]{1}[a-zčćšđž]{2,15}\s[A-ZČĆŠĐŽ]{1}[a-zčćšđž]{2,15}$/;
    if (regExIme.test(vrednostImena)) {
        console.log("Tacno");
        $('#1').removeClass("text-danger");
        $('#1').html ("You have successfully completed the form!");
        $('#1').addClass("text-success");
    }
    else {
        console.log("Netacno");
        $("#1").html (`Name and surname are not entered correctly. (Example: Ann Martin)`);
        $("#1").addClass("text-danger");
    }

    // E-mail adresa
    
    let regExMejl = /^\w([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
    if(regExMejl.test(vrednostMejl)) {
        $("#2").removeClass("text-danger");
        $("#2").html("You have successfully filled in the field!");
        $("#2").addClass("text-success");
    }
    else {
        $("#2").html ("Email address not entered correctly. (Example: ann.Martin00@gmail.com)");	
        $("#2").addClass("text-danger");
    }

    // Naslov

    if (vrednostNaslov.length <= 0) {
        $("#3").html("You did not enter a subject!");
        $("#3").addClass("text-danger");
    }
    else {
        $("#3").removeClass("text-danger");
        $("#3").html("The subject has been forwarded!");
        $("#3").addClass("text-success");
    }

    // Drzava

if ($('#contact-country option:selected').index() == 0) {
    $("#opcija").html("You have to choose a country!");
    $("#opcija").addClass("text-danger");
}
else {
    $("#opcija").removeClass("text-danger");
    $("#opcija").html("You have successfully chosen a country!");
    $("#opcija").addClass("text-success");
}
    // Poruka

if (vrednostPoruka.length <= 0) {
    $("#poruka").html("You did not enter a message!");
    $("#poruka").addClass("text-danger");
}
else {
    $("#poruka").removeClass("text-danger");
    $("#poruka").html("The message has been forwarded!");
    $("#poruka").addClass("text-success");
}
}

// FUNKCIONALNOST DODAVANJA U KORPU

// funkcija za dodavanje proizvoda u korpu
function dodajUKorpu(id){
    if (vecPostojiUKorpi(proizvodi[id - 1])) {
        azurirajKolicinu(proizvodi[id - 1]);
    }
    else {
        let proizvod = proizvodi[id - 1];
        proizvod.kolicina = 1;
        proizvodiUKorpi.push(proizvod);
        localStorage.setItem("proizvodUKorpi", JSON.stringify(proizvodiUKorpi));
        proizvodiUKorpi = JSON.parse(localStorage.getItem('proizvodUKorpi'));
    }
    $(".cart_product_img").html(`(${proizvodiUKorpi.length})`);
  
}
var suma = 0;
function ispisiKorpu() {
    let html = '';

    if (proizvodiUKorpi.length == 0) {
        prikaziPraznuKorpu();
        $("suma").html("0");
        return;
    }

    for(let el of proizvodiUKorpi) {
        html += `<tr>
        <td class="cart_product_img">
            <img src="${el.slika}" alt="${el.naziv}"/>
        </td>
        <td class="qty">
            <div class="quantity">
                <span class="qty-minus" onclick="() => { var effect = document.getElementById('qty'); var qty = effect.value; if( !isNaN( qty ) && qty > 1 ) effect.value--; return false; }"><i class="fa fa-minus" aria-hidden="true"></i></span>
                <input type="number" class="qty-text" step="1" min="1" max="99" name="quantity" value="${el.kolicina}">
                <span class="qty-plus" onclick="() => { var effect = document.getElementById('qty'); var qty = effect.value; if( !isNaN( qty )) effect.value++; return false; }"><i class="fa fa-plus" aria-hidden="true"></i></span>
            </div>
        </td>
        <td class="price"><span>$${el.cena}</span></td>
        <td class="total_price"><span>$${(el.cena * el.kolicina).toFixed(2)}</span></td>
        <td class="action"><i class="icon_close" data-id = "${el.id}"></i></td>
    </tr>`;
    suma += (el.cena * el.kolicina).toFixed(2);
    }

    $('#tabela-korpa tbody').html(html);

    $(".icon_close").click(function() {
        let id = $(this).data("id");
        obrisiIzKorpe(id);
        ispisiKorpu();
    });

    $("#suma").html(function() {
        let sum = 0;
        for(let el of proizvodiUKorpi) 
            sum += el.cena * el.kolicina;
        return sum.toFixed(2);
    })
}

// funkcija koja proverava da li proizvod vec postoji u korpi
function vecPostojiUKorpi(proizvod){
    //console.log(proizvodiUKorpi);
    return (proizvodiUKorpi.filter(el => el.id == proizvod.id).length > 0);
}

function azurirajKolicinu(proizvod) {
    let azuriranProizvod = proizvodiUKorpi.filter(el => el.id == proizvod.id)[0];
    azuriranProizvod.kolicina++;
    proizvodiUKorpi = proizvodiUKorpi.filter(el => el.id != proizvod.id);
    proizvodiUKorpi.push(azuriranProizvod);
    localStorage.setItem("proizvodUKorpi", proizvodiUKorpi);
}

// funkcija koja prikazuje sadrzaj ukoliko je korpa prazna
function prikaziPraznuKorpu(){
    let html = `<div class="row">
                    <div class="col-12">
                        <p class="alert alert-danger">Your shopping cart is empty! There are currently no products to display!</p>
                    </div>
                </div>`
    $("#sadrzajKorpe").html(html);
}

//funkcija za brisanje artikla iz korpe
function obrisiIzKorpe(id) {
    proizvodiUKorpi = proizvodiUKorpi.filter(el => el.id != id);
    localStorage.setItem("proizvodiUKorpi", proizvodiUKorpi);
    proizvodiUKorpi = localStorage.getItem("proizvodiUKorpi");
}