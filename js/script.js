var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
var dataBase = null;
var dato_name, dato_dataini, dato_datafin, dato_duracao, dato_msg =null;

//FUNCAO PARA PUXAR INFO INDEX INCLUIR DATABASE
function startDB(){

        dataBase = indexedDB.open("object", 1);

    dataBase.onupgradeneeded = function (e) {

        var active = dataBase.result;
        var object = active.createObjectStore("people", {keyPath: 'id', autoIncrement: true});
        object.createIndex('by_name', 'name', {unique: false});
        object.createIndex('by_dataini', 'dataini', {unique: true});
        object.createIndex('by_datafin', 'datafin', {unique: true});
        object.createIndex('by_duracao', 'duracao', {unique: true});
        object.createIndex('by_msg', 'msg', {unique: true});
    };
    
    dataBase.onsuccess = function(e){
        //aletar de carregamento
        $('#id').css({'display':'none'});
        clear();
        LoadAll();
    };

    dataBase.onerror = function(e){
        alert('Error Loading');
    };

}

//ADICONAR O A INFORMAÇÃO DO CADASTRO

function add(){
    var active = dataBase.result;
    var data = active.transaction(["people"], "readwrite");
    var object = data.objectStore("people");

    dato_name=document.querySelector("#name").value;
    dato_dataini=document.querySelector("#dataini").value;
    dato_datafin=document.querySelector("#datafin").value;
    dato_duracao=document.querySelector("#duracao").value;
    dato_msg=document.querySelector("#msg").value;

    if(dato_name!=="" && dato_dataini!==""){
        var request = object.add({
            name: dato_name,
            dataini: dato_dataini,
            datafin: dato_datafin,
            duracao: dato_duracao,
            msg: dato_msg

        });

        request.onerror = function(e){
            alert(request.error.name + '\n\n' + request.error.message);

        };
    }
    
    data.oncomplete = function(e){
        document.querySelector('#name').value = '';
        document.querySelector('#dataini').value = '';
        document.querySelector('#datafin').value = '';
        document.querySelector('#duracao').value = '';
        document.querySelector('#msg').value = '';

        
        loadAll();
    };
}

//DELETAR A INFORMAÇÃO REGISTRADA NO LOCALSTORAGE

function deleteId(id) {
    if (confirm("DESEJA APAGAR A INFORMAÇÃO?")){
        var active = dataBase.result;
        var data = active.transaction(["people"], "readwrite");
        var object = data.objectStore("people");

        var request = object.delete(id);

            request.onsuccess = function () {

                alert("Dado apagado");
                loadAll();
            };
    }

}

function load(id) {
    var active = dataBase.result;
    var data = active.transaction(["people"], "readonly");
    var object = data.objectStore("people");

    var request = object.get(parseInt(id));

    request.onsuccess = function(){
        var result = request.result;
        
    };
}

function loadByName(name) {
    var active = dataBase.result;
    var data = active.transaction(["people"], "readonly");
    var object = data.objectStore("people");
    var index = object.index("by_name");
    var requst = index.get(String(name));

    request.onsuccess = function () {
        var result = request.result;
        document.querySelector('#name').value = result.name;
        document.querySelector('#dataini').value = result.dataini;
        document.querySelector('#datafin').value = result.datafin;
        document.querySelector('#duracao').value = result.descricao;
        document.querySelector('#msg').value = result.msg;
        
    };
}

function mostrarId(id) {
    var active = dataBase.result;
    var data = active.transaction(["people"], "readonly");
    var object = data.objectStore("people");
    var request = object.get(id);

    request.onsuccess = function () {
        var result = request.result;
        // 
        document.querySelector('#id').value = result.id;
        document.querySelector('#dataini').value = result.dataini;
        document.querySelector('#datafin').value = result.datafin;
        document.querySelector('#duracao').value = result.descricao;
        document.querySelector('#msg').value = result.msg;
        loadAll();
    };
}


function loadAll(){
    var active = dataBase.result;
    var data = active.transaction(["people"], "readonly");
    var object = data.objectStore("people");

    var elements = [];

    object.openCursor().onsuccess = function (e) {

        var result = e.target.result;

        if(result === null){
            return;
        }

        elements.push(result.value);
            result.continue();
    };

    data.oncomplete = function(){

        var outerHTML = '';

        for (var key in elements){

            outerHTML += '\n\
                    <tr>\n\
                    <td>' + elements[key].name + '</td>\n\
                    <td>' + elements[key].dataini + '</td>\n\
                    <td>' + elements[key].datafin + '</td>\n\
                    <td>' + elements[key].duracao + '</td>\n\
                    <td>' + elements[key].msg + '</td>\n\
                    <td> <input type="button" onclick="deleteId(' + elements[key].id +')" value="Delete"></td>\n\
                    </tr>';
        }
        elements = [];
        document.querySelector("#elementsList").innerHTML = outerHTML;

    };
}

function loadAllByName(){
    var active = dataBase.result;
    var data = active.transaction(["people"], "readonly");
    var object = data.objectStore("people");
    var index = object.index("by_name");

    var elements = [];

    index.openCursor().onsuccess = function (e) {

        var result = e.target.result;

        if (result === null){            return;
        }

        elements.push(result.value);
        result.continue();
    };

    data.oncomplete = function(){
        
        var outerHTML = '';

        for (var key in elements){

            outerHTML += '\n\
            <tr>\n\
            <td>' + elements[key].name + '</td>\n\
            <td>' + elements[key].dataini + '</td>\n\
            <td>' + elements[key].datafin + '</td>\n\
            <td>' + elements[key].duracao + '</td>\n\
            <td>' + elements[key].msg + '</td>\n\
            <td> <input type="button" onclick="deleteId(' + elements[key].id +')" value="Delete"></td>\n\
            </tr>';
        }

        elements= [];
        document.querySelector("#elementsList").innerHTML = outerHTML;

    };
}

function clear(){
    var $=document.getElementById.bind(document);
    $("id").value="";
    $("name").value='';
    $("dataini").value='';
    $("datafin").value='';
    $("duracao").value='';
    $("msg").value='';
}

//FUNÇÃO PESQUISA

function myFunction(){
    var input, filter, table, tr, td, i;

    input=documnet.getElementById("myInput");
    filter=input.value.toUpperCase();
    table=document.getElementById("elementsList");
    tr=table.getElementsByTagName("td");

    for (i = 0; i < tr.length; i++){

        td = tr[i].getElementsByTagName("td")[0]; 
        
            if (td.innerHTML.toUpperCase().indexOf(filter)>-1){
                tr[i].style.display ="";
            }else {
                tr[i].style.display = "none";
            }
        };

    }

