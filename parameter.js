//전역변수
var ajaxURL="http://localhost/codesquad/project/vendingmachine/data.json"
var balanceDiv=document.querySelector(".balance");
var messageDiv=document.querySelector(".message");
var returnDiv=document.querySelector(".returnMoney");
var availableDiv = document.querySelectorAll(".available");
var nav=document.querySelector('nav');
var itemDropdown=document.querySelector('.itemDropdown');
var stockManagerName=document.querySelector('.stockManagerName');
var stockManagerNumber=document.querySelector('.stockManagerNumber');
var stockBtn=document.querySelector('.stockBtn');
var profitBtn=document.querySelector('.profitBtn');
var dateFinder=document.querySelector('.dateFinder');
var dateTotalProfit=document.querySelector('.dateTotalProfit');
var topItem=document.querySelector('.topItem');
var main=document.querySelector('main');
var logTable=document.querySelector(".logTable");


document.addEventListener("DOMContentLoaded",function(){
  init();
});

function init(){
    ajax();
    returnDiv.addEventListener('click',returnMoney)

    // 잔액초기화 함수
    function returnMoney(){
      balanceDiv.innerHTML=0;
      availableSignal();
    }

    //ajax 함수
    function ajax(){
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load",function(){       //콜백함수는 서버가 보내주면 시작한다 페이지가 로드되면 changeContent 함수 실행
    storageToDiv(event.target.responseText);
    });
    oReq.open("GET", ajaxURL);
    oReq.send();
    };

  //storage에 저장된 재고들을 자판기 메뉴버튼에 표시하기, 로그테이블
  function storageToDiv(rawData){
    var parsedStockData = JSON.parse(rawData);
    makeMenuLogTable(parsedStockData,main,logTable);
    ItemtoDropdown(parsedStockData);
    makeTotalMenu();
    var stockNameList=document.querySelectorAll('.stockName');
    var stockDateList=document.querySelectorAll(".stockDate");
    var stockCostList=document.querySelectorAll('.stockCost');
    var stockNumberList=document.querySelectorAll('.stockNumber');
    var stockIncomeList=document.querySelectorAll('.stockIncome');
    var stockProfitList=document.querySelectorAll('.stockProfit');
    var totalProfit=document.querySelector('.totalProfit');
    var totalIncome=document.querySelector('.totalIncome');
    var priceList = document.querySelectorAll(".price");
    var nameList = document.querySelectorAll(".name");
    getTotal(stockIncomeList,totalIncome);
    getTotal(stockProfitList,totalProfit);
    adultClass(parsedStockData, nameList);
    getStorage(parsedStockData,stockNumberList,stockIncomeList,stockProfitList);

    function replaceAll(strData,data,j){
      var time=formatDate();
      var a=strData.replace("{{hotOrCold}}",data[j].hotOrCold);
      var b=a.replace("{{url}}",data[j].url);
      var c=b.replace("{{name}}",data[j].name);
      var d=c.replace("{{price}}",data[j].price);
      var e=d.replace("{{stock}}",data[j].stock);
      var f=e.replace("{{date}}",time);
      var g=f.replace("{{cost}}",data[j].cost);
      return g;
    };

    //메뉴버튼 넣기, 로그테이블 만들기
    function makeMenuLogTable(data,a,b){
      var dataStr=document.querySelector('#dataTemplate').innerHTML;
      var stockStr=document.querySelector('#stockTemplate').innerHTML;
      for(var i=0; i<parsedStockData.length; i++){
        a.insertAdjacentHTML('beforeend',replaceAll(dataStr,data,i));
        b.insertAdjacentHTML('beforeend',replaceAll(stockStr,data,i));
      }

       nameList = document.querySelectorAll(".name");
    }


    //재고 추가 품목명 검색창에 넣어놓기
    function ItemtoDropdown(data){
      var itemStr="<a href='#'>{{name}}</a>"
      for(var i=0; i<data.length; i++){
        itemDropdown.insertAdjacentHTML('beforeend',replaceAll(itemStr,data,i));
      }
    }

    //로그테이블 맨 밑 총매출액, 총영업이익 메뉴 만들기
    function makeTotalMenu(){
      logTable.insertAdjacentHTML('beforeend',"<tr class='total'><td>TOTAL</td><td></td><td class='totalIncome'>0</td><td></td><td></td><td class='totalProfit'>0</td>");
    }

    //총매출액, 총영업이익 값 넣기
    function getTotal(listA, totalA){
        var result=0;
        for(var i=0; i<listA.length; i++){
          result=result+listA[i].innerHTML*1;
        }
          totalA.innerHTML=result;
    };

    //19세 이상 제품에 클래스 추가
    function adultClass(data, list){
      for(var i=0; i<data.length; i++){
        if(data[i].ageLimit>=19 && typeof list==="object"){
          list[i].classList.add("adult");
        }
      }
    };

    //가장 최근 로컬스토리지에 데이터 있으면 로그테이블로 가져오기
    function getRecentTime(arr){
      var orderedDates=arr.sort(function(a,b){
          return Date.parse(a) < Date.parse(b);
          });
      return orderedDates[0];
    };

    function getStorage(data, ListA, ListB, ListC){
      var timeArr=Object.keys(localStorage);
      var recentTime=getRecentTime(timeArr);
      var recentObj=localStorage.getItem(recentTime);
      var parsedObj=JSON.parse(recentObj);
      if(parsedObj!==undefined || parsedObj!==null){
        var keyArr=Object.keys(parsedObj);
        for(var i=0; i<keyArr.length; i++){
          if(parsedObj[keyArr[i]]!==null && parsedObj[keyArr[i]]["재고"]!==undefined){
            for(var j=0; j<data.length; j++){
              if(data[j].name===keyArr[i]){
                ListA[j].innerHTML=parsedObj[keyArr[i]]["재고"];
              }
            }
          }if(parsedObj[keyArr[i]]!==null && parsedObj[keyArr[i]]["매출액"]!==undefined){
            for(var j=0; j<data.length; j++){
              if(data[j].name===keyArr[i]){
                ListB[j].innerHTML=parsedObj[keyArr[i]]["매출액"];
              }
            }
          }if(parsedObj[keyArr[i]]!==null && parsedObj[keyArr[i]]["영업이익"]!==undefined){
            for(var j=0; j<data.length; j++){
              if(data[j].name===keyArr[i]){
                ListC[j].innerHTML=parsedObj[keyArr[i]]["영업이익"];
              }
            }
          }
        }
      }
      getTotal(stockIncomeList,totalIncome);
      getTotal(stockProfitList,totalProfit);
    }
  };

};










function formatDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}

//로그테이블 내용을 로컬스토리지에 넣기
function tableToStorage(){
  var time=formatDate();
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
  var availableDiv=document.querySelectorAll('.available');
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

// dropdowncontent toggle 기능
function toggleContents() {
       event.target.nextElementSibling.classList.toggle("show");
};

// 외부 클릭시 dropdowncontent 숨기기
window.onclick = function(event) {
  var dropdownContents=document.querySelectorAll(".dropdownContent");
  if (!event.target.matches('.dropbtn')) {
    for (var i = 0; i<dropdownContents.length; i++) {
      if (dropdownContents[i].classList.contains('show')) {
        dropdownContents[i].classList.remove('show');
      }
    }
  }
}


//구매시 슬라이딩 애니메이션(클론 후 nav로 내려가기)
function sliding(evt){
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
  var time=formatDate();
  var stockNameList=document.querySelectorAll(".stockName");
  var stockDateList=document.querySelectorAll(".stockDate");
  var stockIncomeList=document.querySelectorAll(".stockIncome");
  var stockProfitList=document.querySelectorAll(".stockProfit");
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
itemDropdown.addEventListener('click',inputItemName);
function inputItemName(evt){
  stockManagerName.value=evt.target.innerText;
  itemDropdown.classList.toggle("show");
};
stockBtn.addEventListener('click',stockManager);
profitBtn.addEventListener('click',profitManager);

function stockManager(){
  var stockNameList=document.querySelectorAll('.stockName');
  var stockNumberList=document.querySelectorAll('.stockNumber');
  var stockProfitList=document.querySelectorAll('.stockProfit');
  var totalProfit=document.querySelector('.totalProfit');
  var stockCostList=document.querySelectorAll('.stockCost');
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
  var dateObj=localStorage.getItem(dateFinder.value);
  var parsedDateObj=JSON.parse(dateObj);
  if(parsedDateObj===null || parsedDateObj===undefined){
    dateTotalProfit.innerHTML="없음";
    topItem.innerHTML="없음";
  }else{
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
  }
};


//메시지
function alertMessage(text){
  messageDiv.innerHTML=text;
};

//광고 슬라이드
var adSlide = setInterval(adContainerMove, 3000);
var logTable=document.querySelector(".logTable");
var adContainer=document.querySelector(".adContainer");
var baseWidth=150;
var prop = adContainer.style.transform;
var xValue=prop.replace(/translate3d\((-?\d+)px.+/,"$1");
logTable.addEventListener('click',adContainerMove);
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
