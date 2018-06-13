import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http'
import './Router.js';
import './Events.js';
import './main.html';

var _UserID    = "";
var MeteorEach = [];

// 骨架
	Template.MainTmp.onRendered(function(){
		
	});

	Template.MainTmp.helpers({
		BackRecord(title){
			switch(title){
				case "訂單詳細記錄":
					return 1;
				break;
			};
		},
		BackOrder(title){
			switch(title){
				case "點餐資訊":
					return 1;
				break;
			};
		},
		Shop(title){
			switch(title){
				case "菜單":
					return 1;
				break;
			};
		},
		BackNotifi(title){
			switch(title){
				case "通知詳細":
					return 1;
				break;
			};
		},
		BackMember(title){
			switch(title){
				case "信箱驗證":
				case "會員條款":
				case "意見反饋":
				case "更換手機":
					return 1;
				break;
			};
		},
		AutoLoginOut(check){
			// Meteor.logout();
			_UserID = Meteor.userId();
			const _status = Meteor.status();
			window.plugins.spinnerDialog.show("", "網路斷網中...",true);

			if( (String(_UserID) == "null") ){
				switch(check){
					case "HOME":
					case "LOGIN":
						Router.go('post.login');
					break;
				};
			};
				
			if(_status.connected){
				window.plugins.spinnerDialog.hide();
			};

			FCMPlugin.onNotification(function (data) {
				if (data.wasTapped) {
					//在app外面收到推播的處理方式。
					//這裡得path必須與servic的path做配合，至於service的格式，記得參考官網
					Router.go(data.path);
				} else {
					//在app裏面收到推播後的處理方式。
					Router.go(data.path);
					alert(data.alert);
				}
			});

		},
		ThreeToolBar(check){
			// 註冊一,註冊二,忘記密碼
			switch(check){
				case "ROA":
				case "ROP":
				case "FORGET":
				case "REFORGET":
					return 1;
				break;
			};
		},
		Login(check){
			if(check == "LOGIN"){
				return 1;
			};
		},
	});

// 點餐排隊
	Template.lineup.onRendered(function(){
		Meteor.subscribe('Shop');		
	});

	Template.lineup.helpers({
		lineupList(){
			MeteorEach = [];
			const _Shop = Mongo_Shop.find({
							'_id': 'Dbn45YndpH4w3JhNL'
						}).fetch();
 
			_Shop.forEach((elem, index)=>{
				const _linelist = elem.linelist;
				_linelist.forEach((_linelistElem, _linelistIndex)=>{
					const _type  = (_linelistElem.type == 2)?"烹飪中":"可取餐";
					const _Color = (_linelistElem.objId == Meteor.userId())?"#CCCCCC":"#f7efea";
					MeteorEach.push({
						Color: _Color,
						number: (_linelistIndex + 1),
						type: _type,
						mailid: _linelistElem.mail,
					});
				});
			});
			return MeteorEach;
		},
	});

// 商家資訊
	Template.shopplugin.onRendered(function(){
		Meteor.subscribe('Shop');
	});

	Template.shopplugin.helpers({
		ShopList(){
			MeteorEach = [];
			
			const _Mongo_Shop = Mongo_Shop.find({}).fetch();
			
			_Mongo_Shop.forEach((elem,index)=>{
				const _linelist_length = (((elem.linelist).length >= 999)?"999":(elem.linelist).length);
			    
			    HTTP.call('GET', 'https://jnadtech.com/1798/ImgTobase64.php', {
			    	params: { 
			    		address: ("img/" + elem.pic)
			    	}
			    }, (err, res) => {
			    	GetShop64.set(res.content);
			    });

				MeteorEach.push({
					name: elem.shopname,
					pic: GetShop64.get(),
					phone: elem.phone,
					open: elem.open,
					close: elem.close,
					wait: _linelist_length,
					objid: elem._id,
					type: elem.type
				});
			});

			return MeteorEach;
		},
		BtnTpye(open){
			return open;
		},
	});

// 通知訊息詳細
	var GetNotif64 = new ReactiveVar("");
	var GetShop64 = new ReactiveVar("");

	Template.NotifiDetail.helpers({
		NotifiDetailList(){
			const Get_NotifiDetail_THIS = this;
			Meteor.call('UpNotifi', Get_NotifiDetail_THIS['_id'], Meteor.userId());

			MeteorEach = [];

			const UNotifi = Mongo_UserNotifi.find({
										'_id':Get_NotifiDetail_THIS['_id']
									}).fetch();
			UNotifi.forEach((UNotifiElem, UNotifiIndex)=>{
				let	_writings = (UNotifiElem.content).replace(/\r\n|\n|\r/g, '<br>');
					_writings = Spacebars.SafeString(_writings);

				HTTP.call('GET', 'https://jnadtech.com/1798/ImgTobase64.php', {
			    	params: { 
			    		address: ("img/" + UNotifiElem.pic)
			    	}
			    }, (err, res) => {
			    	GetNotif64.set(res.content);
			    });

				MeteorEach.push({
					type: UNotifiElem.type,
					title: UNotifiElem.title,
					pic: GetNotif64.get(),
					writings: _writings
				});
			});
			return MeteorEach;
		},
	});

// 通知訊息
	const Read = ['Envelope','OpenMail'];
	Template.Notifi.helpers({
		NotifiList(){
			MeteorEach = [];
			GetNotif64.set("");
			const UIF_notifi = Mongo_UserInfo.find({
										'users_to_id': Meteor.userId()
									}).fetch();

			UIF_notifi.forEach(function(elem,index){
				const _elem_notifi = elem.notifi;

				_elem_notifi.reverse();
				
				_elem_notifi.forEach((_ElNotifielem, _ElNotifiindex)=>{
					const UNotifi = Mongo_UserNotifi.find({
										'_id':_ElNotifielem.user_notifi_id
									}).fetch();

					UNotifi.forEach(function(UNelem, UNindex){
						let StrCut = UNelem.title;
						if(StrCut.length >= 15){
							StrCut = StrCut.substring(0,15)+'...';
						};

						MeteorEach.push({
							objid: _ElNotifielem.user_notifi_id,
							type: UNelem.type,
							title: StrCut,
							path: _ElNotifiindex,
							read: Read[_ElNotifielem.read]
						});
					});
				});
			});
			// Meteor.call('ShowLog',_Mongo_UserInfo);
			return MeteorEach;
		},
	});

// 信箱驗證 
	var Schoolname = new ReactiveVar(0);
	Template.MemberOfMail.helpers({
		CheckMail(){
			const _Mongo_UserInfo = Mongo_UserInfo.find({
										'users_to_id': Meteor.userId()
									}).fetch();
			let _returndata = "";
			_Mongo_UserInfo.forEach((elem, index)=>{
				_returndata = elem.user_school_mail_check
			});

			return _returndata;
		},
		mail(){
			const _Mongo_UserInfo = Mongo_UserInfo.find({
										'users_to_id':Meteor.userId()
									}).fetch();

			let TmpSchoolEmail = "";

			_Mongo_UserInfo.forEach((elem, index)=>{
				const _Mongo_Downtown = Mongo_Downtown.find({
	                                  '_id': elem.user_school_addess
	                                }).fetch();

				_Mongo_Downtown.forEach((DTelem, DTindex)=>{
					const _DTelem_identity = DTelem.identity;

					_DTelem_identity.forEach((_DTelem_identity_elem, _DTelem_identity_index)=>{
						if( (elem.user_school_identity ==_DTelem_identity_elem.name) ){
							TmpSchoolEmail = elem.user_school_mail_id + '@'+ _DTelem_identity_elem.email;
						};
					});

					Schoolname.set(DTelem.name);

				});
			});

	        return TmpSchoolEmail;
		},
		school(){
			if(Schoolname.get() != 0){
				return Schoolname.get();
			};
		},
	});

// 會員專區
	function DateToTrans(date){
	    const loffset = 8;
	    let ltime = date.getTime() + (date.getTimezoneOffset() * 60000);
	    	ltime = new Date(ltime + (3600000 * loffset));
	    return ltime.toLocaleDateString();
	}
	const MemberBtnType = ['danger','success'];
	var MemberSchool = new ReactiveVar(0);
	var MemberEmail  = new ReactiveVar(0);
	var MemberDate 	 = new ReactiveVar(0);
	var MemberPhone  = new ReactiveVar(0);
	Template.Member.helpers({
		BtnMail(){
			const _Mongo_UserInfo = Mongo_UserInfo.find({
										'users_to_id': Meteor.userId()
									}).fetch();
			let _return = "";
			_Mongo_UserInfo.forEach(function(elem, index){

				const _Mongo_Downtown = Mongo_Downtown.find({
					'_id': elem.user_school_addess
				});

				_Mongo_Downtown.forEach((DTelem, DTindex)=>{
					MemberSchool.set(DTelem.name);
				});
				
				MemberEmail.set(elem.user_school_mail_id);
				MemberDate.set(DateToTrans(elem.import.date));
				MemberPhone.set(elem.import.phone);
					
				_return = MemberBtnType[(elem.user_school_mail_check)];
			});
			return _return
		},
		school(){
			if(MemberSchool.get() != 0){
				return MemberSchool.get();
			};
		},
		email(){
			if(MemberEmail.get() != 0){
				return MemberEmail.get();
			};
		},
		date(){
			if(MemberDate.get() != 0){
				return MemberDate.get();
			};
		},
		phone(){
			if(MemberPhone.get() != 0){
				return MemberPhone.get();
			};
		},
	});

// 重置密碼 MeteorID 錯誤導向至logon
	Template.FormatPwd.helpers({
		CheckOut(){
			if( (String(Session.get('MeteorID')) == "undefined") ){
				alert("資料錯誤...");
				Router.go('post.login');
			};
		},
	});

// 學校身份
	var Schoolid   = new ReactiveVar(0);

	Template.TempIdentity.onRendered(function () {
		  Meteor.subscribe('Downtown');
	});

	Template.TempIdentity.helpers({
		Email(){
			MeteorEach = [];
			let getSchoolid = Schoolid.get();
			if(getSchoolid){
				const _Mongo_Downtown = Mongo_Downtown.find({
											'cityid': getSchoolid
										}).fetch();
				
				_Mongo_Downtown.forEach(function(elem, index){
					const _elem_identity = elem.identity;

					_elem_identity.forEach((_elem_identityelem,_elem_identityindex)=>{
						MeteorEach.push({
							'mail': _elem_identityelem.email,
							'identity': _elem_identityelem.name
						});
					});
				});	
			};
			return MeteorEach;
		},
	});

// 城市.大學
	Template.TempSchool.onRendered(function () {
		  Meteor.subscribe('City');
		  Meteor.subscribe('Downtown');
	});

	Template.TempSchool.helpers({
		City(){
			MeteorEach = [];
			const _Mongo_City = Mongo_City.find({}).fetch();
			_Mongo_City.forEach(function(elem){
				MeteorEach.push({
					'id': elem._id,
					'title': elem.name
				});
			});
			return MeteorEach;
		},
		School($id){
			MeteorEach = [];
			const _Mongo_Downtown = Mongo_Downtown.find({'cityid': $id}).fetch();
			_Mongo_Downtown.forEach(function(elem){
				MeteorEach.push({
					'zip': elem._id,
					'title': elem.name
				});
			});
			Schoolid.set($id);
			return MeteorEach;
		},
	});
