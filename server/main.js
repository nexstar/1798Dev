import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email'
import { HTTP } from 'meteor/http'
import { check } from 'meteor/check'
import '/imports/MongoDBCollection.js';

Meteor.startup(function () {
  
  // process.env.MAIL_URL = 'smtp://nexstar1436@gmail.com:Nianbao@800304@smtp.gmail.com:587';
    process.env.MAIL_URL = 'smtp://nianbao@jnadtech.com:Nianbao0304@smtp.gmail.com:587';
  
  // 註冊密碼信箱 
    function SendRegisterPwd(_stdinput, _identity, _Email, _Id) {
      const lUserName = _stdinput + ' (' + _identity + ')';
      const to        = _Email + '<' + _Email + '>';
      const from      = 'nianbao@jnadtech.com';
      const subject   = '校園開通智慧點餐(1798)驗證碼';
      let html  = "<!DOCTYPE html><html><body><div class='row'><div class='col-md-12'>";
          html += '<p>' + lUserName + ' 您好</p><p style="margin-bottom: 0">您正在開通智慧點餐(1798)應用程式</p>';
          html += '<div class="col-md-12" style="margin-top: 1%;margin-bottom: 1%;padding-left: 0;">';
          html += '<a href="https://jnadtech.com/1798/Service/registryEmail.php?registryid=' + _Id + '" target="_blank">請點擊我啟動校園驗證</a></div>';
          html += "<p>JNAD感謝您的對1798智慧點餐的支持</p><p>捷耐德科技股份有限公司(JNAD)</p>";
          html += "<p>---------------------------------------------</p><p>JNAD客服中心(週一至週五 9：00 - 18：00)";
          html += "</p><p>nianbao@jnadtech.com</p><p>---------------------------------------------</p>";
          html += "<h5 style='color: #00000;'>此信件為自動發送，請勿回覆此信箱</h5></div></div></body></html>";
        Email.send({ to, from, subject, html });
    };

  // 意見反饋信箱
    function SendEmail(html) {
      var to      = 'nianbao<nianbao@jnadtech.com>';
      var from    = 'nianbao@jnadtech.com';
      // var to      = 'nexstar1436<nexstar1436@gmail.com>';
      // var from    = 'nexstar1436@gmail.com';
      var subject = '消費者的意見反饋';
      Email.send({ to, from, subject, html });
    };

  // 利用UserId 各自建立 UserOrder Or UserNotifi
    // function addYearFuc(_userid,_years){
    //   let obj   = {};
    //   let obj2  = {};

    //   const month    = 12;
    //   const dayArray = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    //   if (((_years % 4 == 0) && (_years % 100 != 0)) || (_years % 400 == 0)) {
    //     dayArray[1] = 29;
    //   }

    //   for (let i = 0; i < month; i++) {
    //     obj[i]  = [{}];
    //     obj2[i] = [{}];
    //     for (let k = 0; k < dayArray[i]; k++) {
    //       obj2[i][k] = { "order": [] }
    //       obj[i][k]  = {
    //         "message":[]
    //       };
    //     };
    //   };

    //   const newUserNotifi = {
    //     'users_to_id': _userid,
    //     [_years]: obj
    //   };

    //   const newUserOrder = {
    //     'users_to_id': _userid,
    //     [_years]: obj2
    //   };

    //   Mongo_UserOrder.insert(newUserOrder);
    //   Mongo_UserNotifi.insert(newUserNotifi);
    // };

  // 在Notifi中的System加入特定公告
    // _userid  from _id in users
    // _title   公告的標題
    // _content 公告的標題
    // _date    公告到哪月哪日，如果是2017,0,23 0=1月,23=24號 陣列方式進行排序
    function addNotifiSysFuc(_userid,_title, _content, _img, _TimeStamp){
      // let lpath  = Number(_date[0]) + ".";
      //     lpath += Number(Number(_date[1])) + ".";
      //     lpath += Number(Number(_date[2]) - 1) + ".message";
      
      // const AddUserNotifiObj = {
      //   // users_to_id: _userid,
      //   type: '系統',
      //   title: _title,
      //   content: _content,
      //   pic: _img,
      //   timestamp: _TimeStamp,
      //   date: new Date()
      // };
      
      // const GetUserNotifi = Mongo_UserNotifi.insert(AddUserNotifiObj);
      
      // const PushNotifi = {
      //   user_notifi_id: GetUserNotifi,
      //   read:0
      // };

      Mongo_UserInfo.update({'users_to_id': _userid}, {
        $push: {
          'notifi': {
            user_notifi_id: 'cRhzdnXqbEG3BQPby',
            read: 0
          }
        }
      });
    };

  // publish
    // UserInfo
      Meteor.publish('UserInfo', function () {
          return [ Mongo_UserInfo.find()];
      });
    // UserNotifi
      Meteor.publish('UserNotifi', function () {
          return [Mongo_UserNotifi.find()];
      });
    // UserOrder
      Meteor.publish('UserOrder', function () {
          return [Mongo_UserOrder.find()];
      });
    // Shop
      Meteor.publish('Shop', function () {
          return [Mongo_Shop.find()];
      });
    // ShopSingleFood
      Meteor.publish('ShopSingleFood', function () {
          return [Mongo_ShopSingleFood.find()];
      });
    // ShopSingleMenu
      Meteor.publish('ShopSingleMenu', function () {
          return [Mongo_ShopSingleMenu.find()];
      });
    // ShopDoubleFood
      Meteor.publish('ShopDoubleFood', function () {
          return [Mongo_ShopDoubleFood.find()];
      });
    // FoodSauce
      Meteor.publish('FoodSauce', function () {
          return [Mongo_FoodSauce.find()];
      });
    // Downtown
      Meteor.publish('Downtown', function () {
          return [Mongo_Downtown.find()];
      });
    // City
      Meteor.publish('City', function () {
          return [Mongo_City.find()];
      });

  var Nowtime = 0;
  Meteor.setInterval(function(){
    Nowtime = Math.round(new Date().getTime()/1000.0);
    const _Shop = Mongo_Shop.find({}).fetch();
    _Shop.forEach((_ShopElem, _ShopIndex)=>{
      let MeteorEach = [];
      let surplus  = 0;
      const _Open  = (Nowtime >= _ShopElem.TimeStampOpen);
      const _Close = (Nowtime <= _ShopElem.TimeStampClose);

      if(_ShopElem.type){
        if( (_Open && _Close) ){
          // 等候人數 導出全部用戶
          // const WaitPeopleUIF = Mongo_UserInfo.find({}).fetch();
          // WaitPeopleUIF.forEach((UIFelem, UIFindex)=>{
          //   const _UIFelem_order = UIFelem.order;
          //   // 導出用戶之訂購欄位
          //   _UIFelem_order.forEach((_UIFelem_orderElem, _UIFelem_orderIndex)=>{
          //     if(_UIFelem_orderElem.shopid == "Dbn45YndpH4w3JhNL"){
                
          //       if( ( (_UIFelem_orderElem.timestamp) >= _ShopElem.TimeStampOpen ) && 
          //           ( (_UIFelem_orderElem.timestamp) <= _ShopElem.TimeStampClose )){
                  
          //         if( (2 == _UIFelem_orderElem.type) || 
          //             (4 == _UIFelem_orderElem.type) ) {
          //           surplus++;
          //         };
                
          //       };

          //     };
          //   });
          // });
          // console.log("等候人數 " + surplus);

          // 抓取符合當天時間範圍的用戶
            const TodayTimeUIF = Mongo_UserInfo.find({
              order: { 
                $elemMatch: {
                  $and:[
                    {
                      timestamp: { 
                        $gte: _ShopElem.TimeStampOpen
                      }
                    },{
                      timestamp: { 
                      $lte: _ShopElem.TimeStampClose
                    }
                  }]
                }
              }
            }).fetch();

            TodayTimeUIF.forEach((UIFelem, UIFindex)=>{
                const _UIFelem_order = UIFelem.order;
                _UIFelem_order.forEach((_UIFelem_orderElem, _UIFelem_orderIndex)=>{
                  
                  if( (_UIFelem_orderElem.shopid == "Dbn45YndpH4w3JhNL") ){

                    if( ( (_UIFelem_orderElem.timestamp) >= _ShopElem.TimeStampOpen ) && 
                        ( (_UIFelem_orderElem.timestamp) <= _ShopElem.TimeStampClose) ){
                      
                      if( (_UIFelem_orderElem.type == 2) || 
                          (_UIFelem_orderElem.type == 4) ){
                        MeteorEach.push({
                            objId: UIFelem.users_to_id,
                            mail: UIFelem.user_school_mail_id,
                            type: _UIFelem_orderElem.type,
                            timestamp: _UIFelem_orderElem.timestamp
                        });
                      };

                    };

                  };

                });
            });

            MeteorEach.sort(function (a, b) {
              return a.timestamp - b.timestamp;
            });
            
            Mongo_Shop.update({'_id': 'Dbn45YndpH4w3JhNL'},{
                $set: {
                  wait: surplus,
                  linelist: MeteorEach
                }
              }
            );
            // console.log("時間範圍 " + MeteorEach.length);
        }else{
          console.log("nowtime: " + Nowtime);
          console.log("open: " + _Open);
          console.log("close: " + _Close);
          console.log("TimeStampOpen: " + _ShopElem.TimeStampOpen);
          console.log("TimeStampClose: " + _ShopElem.TimeStampClose);
        };
      }else{
        console.log(_ShopElem.shopname + " 尚未開店");
      };

    });
  },15000);
  console.log("十五秒後執行....")

  // client call Server
    Meteor.methods({
      // AddSurplus
      InsertSurplus:()=>{
                            
        const _SSF = Mongo_ShopSingleFood.find({}).fetch();
        _SSF.forEach((elem, index)=>{

          Mongo_ShopSingleFood.update({'_id': elem._id},{
            $push: {
              'surplus': {
                count: 1
              }
            }
          });

        });

        return 1;
      },
      // DobulePush
      DobulePush:(objid)=>{
        Mongo_ShopSingleFood.update(
          { '_id': objid },
          {$push: { surplus: { count: 1} }
        });
        return 1;
      },
      // DobulePull
      DobulePull:(objid)=>{
        Mongo_ShopSingleFood.update(
          { '_id': objid },
          {$pop: { surplus: -1 }
        });
        return 1;
      },
      // SinglePush
      SinglePush:(objid)=>{
        Mongo_ShopSingleFood.update(
          { '_id': objid },
          {$push: { surplus: { count: 1} }
        });
        return 1;
      },
      // SinglePull
      SinglePull:(objid)=>{
        Mongo_ShopSingleFood.update(
          { '_id': objid },
          {$pop: { surplus: -1 }
        });
        return 1;
      },
      // 下單至DB
      CartToInsert:(_shopid, _objid, _data, _timestamp)=>{
        const GetobjId = Mongo_UserOrder.insert(_data);
        Mongo_UserInfo.update({
          'users_to_id': _objid
        }, {
          $push: {
            'order': {
              shopid: _shopid,
              user_order_id: GetobjId,
              type: 0,
              timestamp: _timestamp,
              date: new Date()
            }
          }
        });
        return 1;
      },
      // 通知已閱讀
      UpNotifi:(_path,_id)=>{
        Mongo_UserInfo.update({'users_to_id': _id}, {
          $set: {
            [_path]: 1
          }
        });
        return 1;
      },
      // 用戶舊手機轉換新手機
      ChangePhone:(_id, _oldemail , _newemail, _newphone) => {
        Accounts.removeEmail(_id, _oldemail);
        Accounts.addEmail(_id, _newemail);
        Mongo_UserInfo.update({'users_to_id': _id}, {
          $set: {
            'import.phone': _newphone
          }
        });
        return 1;
      },
      // 校園點餐信箱驗證
      RegisterEmail: (_stdid, _identity, _email, _id) => {
        SendRegisterPwd(_stdid, _identity, _email, _id);
        return 1;
      },
      // 用戶反饋與建議
      UserComment(_id,_contents){
        const _Mongo_UserInfo = Mongo_UserInfo.findOne({'users_to_id':_id});
        const _Mongo_Downtown = Mongo_Downtown.findOne({
                                  '_id':_Mongo_UserInfo.user_school_addess
                                });
        let TmpSchoolEmail = "";
        _Mongo_Downtown.identity.forEach(function(elem){
          if(_Mongo_UserInfo.user_school_identity == elem.name){
            TmpSchoolEmail = _Mongo_UserInfo.user_school_mail_id + '@'+ elem.email;
          };
        });

        let lhtml  = "<!DOCTYPE html><html><body><div class='row'><div class='col-md-12'>";
            lhtml += "<p>學校名稱：" + _Mongo_Downtown.name + "</p>";
            lhtml += "<p>學校信箱：" + TmpSchoolEmail + "</p>";
            lhtml += "<p>學校身份：" + _Mongo_UserInfo.user_school_identity; + "</p>";
            lhtml += "<p>手機：" + '( '+_Mongo_UserInfo.import.platform +' ) '+ _Mongo_UserInfo.import.phone + "</p>";
            lhtml += "<p>內容：" + _contents + "</p></div></div></body></html>";
        SendEmail(lhtml);
        return 1;
      },
      // 登出後清除Token
      UpToken(_id){
        Mongo_UserInfo.update({'users_to_id': _id}, {
          $set: {
            'import.token': '',
            'import.uuid': '',
            'import.platform': ''
          }
        });
        return 1;
      },
      // 更新 Token uuid platform
      UpdateInfo:(_id, Token, uuid, platform)=>{
        Mongo_UserInfo.update({'users_to_id': _id}, {
          $set: {
            'import.token': Token,
            'import.uuid': uuid,
            'import.platform': platform
          }
        });
        return 1;
      },
      // 檢查手機是否註冊過
      CheckPhone:(phone)=>{
        let gobacktphone = Mongo_UserInfo.find({'import.phone':phone}).count();
        return gobacktphone;
      },
      // 建立 UserOrder Or UserNotifi
      CreateUseInfo:(obj, Usersid, Year, YMD, TimeStamp)=>{
        Mongo_UserInfo.insert(obj);
        // addYearFuc(Usersid,Year);
        const _title  = "1798智慧點餐系統";
        let _content  = "首先感謝您註冊，1798智慧點餐，1798即將改變您在點餐上的習慣";
            _content += "，只需要完成下單並商家同意受理訂單後，只需等待商家通知即可前往取餐，";
            _content += "這樣的方式可讓您減少10-20分鐘的等待時間。\r\n\r\n1798智慧點餐";
            _content += "在此感謝您使用。\r\n\r\n順您一切順心＾＾";
        const _img    = "1798.png";
        addNotifiSysFuc(Usersid,_title, _content, _img, TimeStamp);
        return 1;
      },
      // 重置密碼
      ReSetPwd:(_id,_newpwd)=>{
        Accounts.setPassword(_id, _newpwd);
        return 1;
      },
      // SERVER See Log 
    	ShowLog:(vlog)=>{
        console.log(vlog);
    	},
    });

  // Service 臉書系統
    ServiceConfiguration.configurations.remove({
      service: "facebook"
    });

    ServiceConfiguration.configurations.insert({
      service: "facebook",
      // GreenPet
      // appId: '438183633234690',
      // secret: '72cac95ab7a0bec05a36b121447706ec',
      // 1798
      appId: '678188439033764',
      secret: '8174e0b04fa29519397ebfdefe6826db',
      loginStyle: 'redirect'
    });

    Accounts.onCreateUser(function (options, user) {
      if (!user.services.facebook) {
        return user;
      }
      user.username = user.services.facebook.name;
      personal = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=large";
      user.profile = {
            facebook: 1,
            address: user.services.facebook.email,
            link: user.services.facebook.link,
            pic: personal,
            gender: user.services.facebook.gender
        };
      return user;
    });

});