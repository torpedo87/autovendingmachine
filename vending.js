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

  //storage에 저장된 재고들을 자판기 메뉴버튼에 표시하기, 로그테이블
  function storageToDiv(rawData){
    var parsedStockData = JSON.parse(rawData);
    var main=document.querySelector('main');
    var logTable=document.querySelector(".logTable");
    var d=new Date();
    var time=d.toLocaleDateString();
    //template 작업인데 뭔가 코드가 더 길어진것 같다...
    var dataStr="<div class={{hotOrCold}}><img src={{url}}><div class='name'>{{name}}</div><div class='price'>{{price}}</div></div>"
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


    //메뉴버튼 넣기, 로그테이블 만들기
    for(var i=0; i<parsedStockData.length; i++){
      main.insertAdjacentHTML('beforeend',replaceAll(dataStr,i));
      logTable.insertAdjacentHTML('beforeend',replaceAll(stockStr,i));
    }
    var stockIncomeList=document.querySelectorAll('.stockIncome');
    var stockProfitList=document.querySelectorAll('.stockProfit');
    var stockNumberList=document.querySelectorAll('.stockNumber');

    //로그테이블 맨 밑 총매출액, 총영업이익 메뉴 만들기
    logTable.insertAdjacentHTML('beforeend',"<tr class='total'><td>TOTAL</td><td></td><td class='totalIncome'>0</td><td></td><td></td><td class='totalProfit'>0</td>");

    //총매출액, 총영업이익 값 넣기
    function getTotal(){
      var totalIncome=document.querySelector('.totalIncome');
      var totalProfit=document.querySelector('.totalProfit');
      //총매출 합
      function getTotalIncome(){
        var result=0;
        for(var i=0; i<stockIncomeList.length; i++){
          result=result+stockIncomeList[i].innerHTML*1;
        }return result;
      }
      totalIncome.innerHTML=getTotalIncome();

      //총영업이익 합
      function getTotalProfit(){
        var result=0;
        for(var i=0; i<stockProfitList.length; i++){
          result=result+stockProfitList[i].innerHTML*1;
        }return result;
      }
      totalProfit.innerHTML=getTotalProfit();
    }
    getTotal();


    //19세 이상 제품에 클래스 추가
    for(var i=0; i<parsedStockData.length; i++){
      if(parsedStockData[i].ageLimit>=19){
        var nameList = document.querySelectorAll(".name");
        nameList[i].classList.add("adult");
      }
    }
    //가장 최근 로컬스토리지에 데이터 있으면 로그테이블로 가져오기
    var totalProfit=document.querySelector('.totalProfit');
    var totalIncome=document.querySelector('.totalIncome');
    var timeArr=Object.keys(localStorage);
    function getRecentTime(arr){
      var orderedDates=arr.sort(function(a,b){
          return Date.parse(a) < Date.parse(b);
          });
      return orderedDates[0];
    };
    var recentTime=getRecentTime(timeArr);
    var recentObj=localStorage.getItem(recentTime);
    var parsedObj=JSON.parse(recentObj);
    if(parsedObj!==null){
      getStorage();
    }
    function getStorage(){
      if(parsedObj!==undefined || parsedObj!==null){
        var keyArr=Object.keys(parsedObj);
        for(var i=0; i<keyArr.length; i++){
          if(parsedObj[keyArr[i]]!==null && parsedObj[keyArr[i]]["재고"]!==undefined){
            for(var j=0; j<parsedStockData.length; j++){
              if(parsedStockData[j].name===keyArr[i]){
                stockNumberList[j].innerHTML=parsedObj[keyArr[i]]["재고"];
              }
            }
          }if(parsedObj[keyArr[i]]!==null && parsedObj[keyArr[i]]["매출액"]!==undefined){
            for(var j=0; j<parsedStockData.length; j++){
              if(parsedStockData[j].name===keyArr[i]){
                stockIncomeList[j].innerHTML=parsedObj[keyArr[i]]["매출액"];
              }
            }
          }if(parsedObj[keyArr[i]]!==null && parsedObj[keyArr[i]]["영업이익"]!==undefined){
            for(var j=0; j<parsedStockData.length; j++){
              if(parsedStockData[j].name===keyArr[i]){
                stockProfitList[j].innerHTML=parsedObj[keyArr[i]]["영업이익"];
              }
            }
          }
        }
      }getTotal();
    }


  };

  // 반환레버 기능(잔액 초기화)
  returnDiv.addEventListener('click',returnMoney)
  function returnMoney(){
    balanceDiv.innerHTML=0;
    availableSignal();
  }
};

//로그테이블 내용을 로컬스토리지에 넣기
function tableToStorage(){
  var d=new Date();
  var time=d.toLocaleDateString();
  var stockNameList=document.querySelectorAll('.stockName');
  var stockNumberList=document.querySelectorAll('.stockNumber');
  var stockIncomeList=document.querySelectorAll('.stockIncome');
  var stockProfitList=document.querySelectorAll('.stockProfit');
  var totalProfit=document.querySelector('.totalProfit');
  var tableObj={};
  for(var i=0; i<stockNameList.length; i++){
    tableObj[stockNameList[i].innerHTML]={};
    tableObj[stockNameList[i].innerHTML]["재고"]=stockNumberList[i].innerHTML;
    tableObj[stockNameList[i].innerHTML]["매출액"]=stockIncomeList[i].innerHTML;
    tableObj[stockNameList[i].innerHTML]["영업이익"]=stockProfitList[i].innerHTML;
  }tableObj["총영업이익"]=totalProfit.innerHTML;
  var stringifiedTableObj=JSON.stringify(tableObj);
  localStorage.setItem(time,stringifiedTableObj);
}



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

function reduceStock(evt){
  var d=new Date();
  var time=d.toLocaleDateString();
  var stockNumberList=document.querySelectorAll(".stockNumber");
  var stockNameList=document.querySelectorAll(".stockName");
  for(var i=0; i<stockNumberList.length; i++){
    if(evt.target.innerHTML===stockNameList[i].innerHTML && evt.target.classList.contains("available")){
      //로그테이블 변경(재고)
      stockNumberList[i].innerHTML= stockNumberList[i].innerHTML*1-1;
      //로컬스토리지 변경(재고)
      tableToStorage();
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
function logMessage(evt){

  var logTable=document.querySelector(".logTable");
  // var totalIncome=document.querySelector(".totalIncome")
  var d=new Date();
  var time=d.toLocaleDateString();
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
      if(stockNameList[i].innerHTML===evt.target.innerHTML && stockDateList[i].innerHTML===time){
        //로그테이블 변경(매출액,영업이익,총매출액,총영업이익)
        stockIncomeList[i].innerHTML=stockIncomeList[i].innerHTML*1+evt.target.nextElementSibling.innerHTML*1;
        stockProfitList[i].innerHTML=stockProfitList[i].innerHTML*1+evt.target.nextElementSibling.innerHTML*1;
        totalIncome.innerHTML=totalIncome.innerHTML*1+evt.target.nextElementSibling.innerHTML*1;
        totalProfit.innerHTML=totalProfit.innerHTML*1+evt.target.nextElementSibling.innerHTML*1;
        //로컬스토리지 변경(매출액,영업이익,총영업이익)
        tableToStorage();
      }
    }

  }
};

//재고 구매시 로그테이블,로컬스토리지 변경 (재고수 증가, 영업이익 감소, 총영업이익감소)

var stockBtn=document.querySelector('.stockBtn');
var profitBtn=document.querySelector('.profitBtn');
stockBtn.addEventListener('click',stockManager);
profitBtn.addEventListener('click',profitManager);
function stockManager(){
  var stockNumberList=document.querySelectorAll(".stockNumber");
  var stockNameList=document.querySelectorAll(".stockName");
  var stockManagerName=document.querySelector('.stockManagerName');
  var stockManagerNumber=document.querySelector('.stockManagerNumber');
  var stockCostList=document.querySelectorAll('.stockCost');
  var stockProfitList=document.querySelectorAll('.stockProfit');
  var totalProfit=document.querySelector('.totalProfit');
  var d=new Date();
  var time=d.toLocaleDateString();
  for(var i=0; i<stockNameList.length; i++){
    if(stockManagerName.value===stockNameList[i].innerHTML && parseInt(stockManagerNumber.value)>0){
      //로그테이블 변경
      stockNumberList[i].innerHTML=stockNumberList[i].innerHTML*1+parseInt(stockManagerNumber.value)
      stockProfitList[i].innerHTML=stockProfitList[i].innerHTML*1-parseInt(stockManagerNumber.value)*stockCostList[i].innerHTML*1;
      totalProfit.innerHTML=totalProfit.innerHTML*1-parseInt(stockManagerNumber.value)*stockCostList[i].innerHTML*1;
      //로컬스토리지 변경
      tableToStorage();
    }
  }
  stockManagerName.value="";
  stockManagerNumber.value="";
  //구매가능표시 리셋
  availableSignal();
}

//날짜별 총수익, 1순위품목 확인
function profitManager(){
  var dateFinder=document.querySelector('.dateFinder');
  var dateTotalProfit=document.querySelector('.dateTotalProfit');
  var topItem=document.querySelector('.topItem');
  var dateObj=localStorage.getItem(dateFinder.value);
  var parsedDateObj=JSON.parse(dateObj);
  var arr=Object.keys(parsedDateObj).map(maxCheck);
  function maxCheck(key){
    if(key==="총영업이익"){
      return 0;
    }else{
      return parsedDateObj[key]["영업이익"]
    }

  };
  var max=Math.max.apply(null,arr);
  dateTotalProfit.innerHTML=parsedDateObj["총영업이익"];
  for(key in parsedDateObj){
      if(parseInt(parsedDateObj[key]["영업이익"])===max){
        var maxKey=key;
      };
  }
  topItem.innerHTML=maxKey;

};




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
