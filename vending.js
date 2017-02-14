//흐름도를 그려라!!!!
document.addEventListener("DOMContentLoaded",function(){
  init();
});
//global variables 전역변수 모아놓기
var ajaxURL="http://localhost/codesquad/project/vendingmachine/data.json"
var balanceDiv=document.querySelector(".balance");
var messageDiv=document.querySelector(".message");
var returnDiv=document.querySelector(".returnMoney");


function init(){

  //ajax 호출
    function ajax(){
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load",function(){       //콜백함수는 서버가 보내주면 시작한다 페이지가 로드되면 changeContent 함수 실행
    storageToDiv(event.target.responseText);
    });
    oReq.open("GET", ajaxURL);
    oReq.send();
    };
    ajax();

  //storage에 저장된 재고들을 자판기 메뉴버튼에 표시하기
  function storageToDiv(rawData){
    var parsedStockData = JSON.parse(rawData);
    var main=document.querySelector('main');
    var logTable=document.querySelector(".logTable");
    var d=new Date();
    var time=d.getDate();

    //template 작업인데 뭔가 코드가 더 길어진것 같다...
    var dataStr="<div class={{hotOrCold}}><img src={{url}}><div class='name'>{{name}}</div><div class='price'>{{price}}</div></div>"
    // var stockStr="<tr class='stock'><td class='stockName'>{{name}}</td><td class='stockNumber'>{{stock}}</td><td class='stockDate'>{{date}}</td><td class='stockCost'>{{cost}}</td><td class='stockProfit'>0</td>";
    var stockStr="<tr class='stock'><td class='stockName'>{{name}}</td><td class='stockNumber'>{{stock}}</td><td class='stockIncome'>0</td><td class='stockDate'>{{date}}</td><td class='stockCost'>{{cost}}</td><td class='stockProfit'>0</td>";

    function replaceAll(someData,j){
      var a=someData.replace("{{hotOrCold}}",parsedStockData[j].hotOrCold);
      var b=a.replace("{{url}}",parsedStockData[j].url);
      var c=b.replace("{{name}}",parsedStockData[j].name);
      var d=c.replace("{{price}}",parsedStockData[j].price);
      var e=d.replace("{{stock}}",parsedStockData[j].stock);
      var f=e.replace("{{date}}",time);
      var g=f.replace("{{cost}}",parsedStockData[j].cost);
      return g;
    };
    var originalObj=localStorage.getItem(time);
    var parsedObj=JSON.parse(originalObj);
    for(var i=0; i<parsedStockData.length; i++){
      main.insertAdjacentHTML('beforeend',replaceAll(dataStr,i));
      logTable.insertAdjacentHTML('beforeend',replaceAll(stockStr,i));
    }
    var stockIncomeList=document.querySelectorAll('.stockIncome');
    var stockProfitList=document.querySelectorAll('.stockProfit');
    var stockNumberList=document.querySelectorAll('.stockNumber');

    //ajax로 가져온것 로컬스토리지에 넣어버리기

    //로컬스토리지에서 가져오기
    for(var i=0; i<parsedStockData.length; i++){
      if(parsedObj!==null && Object.keys(parsedObj).includes(parsedStockData[i].name)){

        stockNumberList[i].innerHTML=parsedObj[parsedStockData[i].name]["재고"];
        stockProfitList[i].innerHTML=parsedObj[parsedStockData[i].name]["영업이익"];
        if(parsedObj[parsedStockData[i].name]["매출액"]===undefined){
          stockIncomeList[i].innerHTML=0;
        }else{
          stockIncomeList[i].innerHTML=parsedObj[parsedStockData[i].name]["매출액"];
        }


      }
    }

    // for(var i=0; i<parsedStockData.length; i++){
    //   main.insertAdjacentHTML('beforeend', "<div class="+parsedStockData[i].hotOrCold+"><img src="+parsedStockData[i].url+"><div class='name'>"+parsedStockData[i].name+"</div><div class='price'>"+parsedStockData[i].price+"</div></div>");
    //   logTable.insertAdjacentHTML('beforeend',"<tr class='stock'><td class='stockName'>"+parsedStockData[i].name+"</td><td class='stockNumber'>"+parsedStockData[i].stock+"</td><td class='stockIncome'>0</td><td class='stockDate'>"+time+"</td></tr>");
    // }

    // logTable.insertAdjacentHTML('beforeend',"<tr class='total'><td>TOTAL</td><td></td><td></td><td></td><td class='totalProfit'>0</td>");
    logTable.insertAdjacentHTML('beforeend',"<tr class='total'><td>TOTAL</td><td></td><td class='totalIncome'>0</td><td></td><td></td><td class='totalProfit'>0</td>");
    var totalProfit=document.querySelector('.totalProfit');
    var totalIncome=document.querySelector('.totalIncome');
    var originalObj=localStorage.getItem(time);
    var parsedObj=JSON.parse(originalObj);
    for(var i=0; i<parsedStockData.length; i++){
      if(parsedObj!==null && Object.keys(parsedObj).includes("총매출액")){
        totalIncome.innerHTML=parsedObj["매출액"];
        totalProfit.innerHTML=parsedObj["재고"];
      }
    }
    for(var i=0; i<parsedStockData.length; i++){
      if(parsedStockData[i].ageLimit>=19){
        var nameList = document.querySelectorAll(".name");
        nameList[i].classList.add("adult");
      }
    }
  };



  // 반환레버 기능(잔액 초기화)
  returnDiv.addEventListener('click',returnMoney)
  function returnMoney(){
    balanceDiv.innerHTML=0;
    availableSignal();
  }
};


// 돈 투입하고 구매가능한 표시(드래그앤드롭)
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

//동전 드래그앤 드롭시 잔액 합산
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data).cloneNode(true));
    function howMuch(data){
      switch(data){
        case "smallCoin":
        return 100;
        break;
        case "bigCoin":
        return 500;
        break;
        case "paperMoney":
        return 1000;
      }
    }
    balanceDiv.innerHTML= balanceDiv.innerHTML*1 + howMuch(data);
    //잔액에 따른 구매가능표시
    availableSignal();
}


//활성화 버튼표시하기
function availableSignal(){
  var priceList = document.querySelectorAll(".price");
  var nameList = document.querySelectorAll(".name");
  var stockNumberList=document.querySelectorAll(".stockNumber");
  for(var i=0; i<priceList.length; i++){
    // console.log(parseInt(stockList[i].innerHTML));
    if(balanceDiv.innerHTML*1>=priceList[i].innerHTML*1 && stockNumberList[i].innerHTML*1>0){
      nameList[i].classList.add("available");
    }else{
      nameList[i].classList.remove("available");
    }
  }
  setBtnEvent();
};


// 활성화된 버튼이벤트 등록
function setBtnEvent(){
  var availableDiv = document.querySelectorAll(".available");
  for(var i=0; i<availableDiv.length; i++){
    availableDiv[i].addEventListener('click', pressAvailableBtn);
  }
};
function pressAvailableBtn(evt){
  if(evt.target.classList.contains("adult")){
    var answer=prompt("what is your age?");
      if(parseInt(answer)>=19){
        reduceBalance(evt);
        reduceStock(evt);
        logMessage(evt);
        sliding(evt);
        availableSignal();
      }
      else{
        evt.target.classList.remove("available");
        alertMessage("Sorry, you cannot buy this");
        setTimeout(function(){messageDiv.innerHTML="";},3000);
      }
  }else{
    reduceBalance(evt);
    reduceStock(evt);
    logMessage(evt);
    sliding(evt);
    availableSignal();
  }
};

//구매시 잔액 감소
function reduceBalance(evt){
  if(evt.target.classList.contains("available")){
    balanceDiv.innerHTML=balanceDiv.innerHTML*1-evt.target.nextElementSibling.innerHTML*1;
  }
}

//구매시 재고 감소
var objValue={};
function reduceStock(evt){
  var d=new Date();
  var time=d.getDate();
  var stockNumberList=document.querySelectorAll(".stockNumber");
  var stockNameList=document.querySelectorAll(".stockName");
  for(var i=0; i<stockNumberList.length; i++){
    if(evt.target.innerHTML===stockNameList[i].innerHTML && evt.target.classList.contains("available")){
      stockNumberList[i].innerHTML= stockNumberList[i].innerHTML*1-1;
      objValue[stockNameList[i].innerHTML]={};
      objValue[stockNameList[i].innerHTML]["재고"]=stockNumberList[i].innerHTML;
      localStorage.setItem(time,JSON.stringify(objValue));
      return;
    }
  }
}

//구매시 슬라이딩 애니메이션(클론 후 nav로 내려가기)
function sliding(evt){
  // console.log("slide");
  var cloneImg=evt.target.previousElementSibling.cloneNode(true);
  var nav=document.querySelector('nav');
  var slidingDiv=nav.querySelector('div');
  if(evt.target.classList.contains("available")){
    slidingDiv.appendChild(cloneImg);
    slidingDiv.style.transition='transform 3s';
    slidingDiv.style.transform='translate3d(0,700px,0)';
    slidingDiv.addEventListener('transitionend',removeImg);
    function removeImg(){
      slidingDiv.removeChild(slidingDiv.childNodes[0]);
      nav.innerHTML="<div style='transform: translate3d(0,0px,0)'></div>";
    }
  }

};





//구매시 매출액 증가, 영업이익 증가
var obj={};
function logMessage(evt){
  var logTable=document.querySelector(".logTable");
  // var totalIncome=document.querySelector(".totalIncome")
  var d=new Date();
  var time=d.getDate();
  var stockNumberList=document.querySelectorAll(".stockNumber");
  var stockNameList=document.querySelectorAll(".stockName");
  var stockDateList=document.querySelectorAll(".stockDate");
  var stockIncomeList=document.querySelectorAll(".stockIncome");
  var stockProfitList=document.querySelectorAll(".stockProfit");
  var total=document.querySelector('.total');
  var totalProfit=document.querySelector('.totalProfit');
  var totalIncome=document.querySelector('.totalIncome');
  if(evt.target.classList.contains("available")){
    for(var i=0; i<stockNameList.length; i++){
      if(stockNameList[i].innerHTML===evt.target.innerHTML && stockDateList[i].innerHTML*1===time){
        stockIncomeList[i].innerHTML=stockIncomeList[i].innerHTML*1+evt.target.nextElementSibling.innerHTML*1;
        stockProfitList[i].innerHTML=stockProfitList[i].innerHTML*1+evt.target.nextElementSibling.innerHTML*1;
        totalIncome.innerHTML=totalIncome.innerHTML*1+evt.target.nextElementSibling.innerHTML*1;
        totalProfit.innerHTML=totalProfit.innerHTML*1+evt.target.nextElementSibling.innerHTML*1;
        obj[stockNameList[i].innerHTML]={};
        obj[stockNameList[i].innerHTML]["영업이익"]=stockProfitList[i].innerHTML;
        obj[stockNameList[i].innerHTML]["매출액"]=stockIncomeList[i].innerHTML;
        obj["총영업이익"]=totalProfit.innerHTML;
        localStorage.setItem(time,JSON.stringify(obj));
        return;
      }
    }

  }
};

//재고추가시 재고수 증가, 영업이익 감소, 총수익감소
var stockBtn=document.querySelector('.stockBtn');
var profitBtn=document.querySelector('.profitBtn');
stockBtn.addEventListener('click',stockManager);
profitBtn.addEventListener('click',profitManager);
var objValue={};
function stockManager(){
  var stockNumberList=document.querySelectorAll(".stockNumber");
  var stockNameList=document.querySelectorAll(".stockName");
  var stockManagerName=document.querySelector('.stockManagerName');
  var stockManagerNumber=document.querySelector('.stockManagerNumber');
  var stockCostList=document.querySelectorAll('.stockCost');
  var stockProfitList=document.querySelectorAll('.stockProfit');
  var totalProfit=document.querySelector('.totalProfit');
  var d=new Date();
  var time=d.getDate();
  for(var i=0; i<stockNameList.length; i++){
    if(stockManagerName.value===stockNameList[i].innerHTML && parseInt(stockManagerNumber.value)>0){
      stockNumberList[i].innerHTML=stockNumberList[i].innerHTML*1+parseInt(stockManagerNumber.value)
      stockProfitList[i].innerHTML=stockProfitList[i].innerHTML*1-parseInt(stockManagerNumber.value)*stockCostList[i].innerHTML*1;
      totalProfit.innerHTML=totalProfit.innerHTML*1-parseInt(stockManagerNumber.value)*stockCostList[i].innerHTML*1;
      objValue[stockNameList[i].innerHTML]={};
      objValue[stockNameList[i].innerHTML]["영업이익"]=stockProfitList[i].innerHTML;
      objValue[stockNameList[i].innerHTML]["재고"]=stockNumberList[i].innerHTML;
      objValue["총영업이익"]=totalProfit.innerHTML;
      localStorage.setItem(time,JSON.stringify(objValue));
    }
  }
  stockManagerName.value="";
  stockManagerNumber.value="";
  availableSignal();
}

function profitManager(){
  var dateFinder=document.querySelector('.dateFinder');
  if(localStorage.getItem(dateFinder.value)!=="undefined"){
    var dateProfit=document.querySelector('.dateProfit');
    var topItem=document.querySelector('.topItem');
    var dateObj=localStorage.getItem(dateFinder.value);
    var parsedDateObj=JSON.parse(dateObj);
    dateProfit.innerHTML=parsedDateObj["totalProfit"];
    var arr=Object.keys(parsedDateObj).map(function(key){return parsedDateObj[key]});
    var max=Math.max.apply(null,arr);
    for(key in parsedDateObj){
      if(parseInt(parsedDateObj[key])===max){
        var maxKey=key;
      };
    }
    topItem.innerHTML=maxKey;
  }
}




//메시지
function alertMessage(text){
  messageDiv.innerHTML=text;
};

//광고 슬라이드
var adSlide = setInterval(adContainerMove, 3000);
var logTable=document.querySelector(".logTable");
logTable.addEventListener('click',adContainerMove);
var adContainer=document.querySelector(".adContainer");
var baseWidth=150;
var prop = adContainer.style.transform;
var xValue=prop.replace(/translate3d\((-?\d+)px.+/,"$1");

adContainer.addEventListener("transitionend",goBack);

function goBack(){
  if(xValue===-300){
        adContainer.style.transition="none";
        xValue=150;
        adContainer.style.transform="translate3d("+xValue+"px,0,0)";
  }else{
    adContainer.style.transition="all 1s";
  }
}

//1칸씩 이동
function adContainerMove(){
  if(xValue%baseWidth===0){
    adContainer.style.transition="all 1s";
    xValue=xValue-baseWidth;
    adContainer.style.transform="translate3d("+xValue+"px,0,0)";
  }
};

// function adContainerMove(){
//   if(xValue===-150){
//     adContainer.style.transition="none";
//     xValue=150;
//     adContainer.style.transform="translate3d("+xValue+"px,0,0)";
//   }else if(xValue%baseWidth===0){
//     adContainer.style.transition="all 0.6s";
//     xValue=xValue-baseWidth;
//     adContainer.style.transform="translate3d("+xValue+"px,0,0)";
//   }
// };
