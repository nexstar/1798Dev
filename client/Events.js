import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http'
import './Router.js';
import './Helpers.js';
import './main.html';
import '/imports/MongoDBCollection.js'

// 註冊型態 一般 Or FB
var RegisterStep = new ReactiveVar(0);
// (註冊 ＆ 更換手機) 簡訊檢查碼
var ROPStepCode  = new ReactiveVar(0);
// 註冊第二步 密碼確認
var ROAStepCheck = new ReactiveVar(0);
// 註冊電話
var ROPPhone 	 = new ReactiveVar(0);
// 忘記密碼簡訊檢查碼
var ForgetCode 	 = new ReactiveVar(0);
// 重制密碼 密碼確認
var ReNewPwdCode = new ReactiveVar(0);

var MeteorEach = [];

var H_window = 0;

const _SingleOrDouble = ['套餐','單點'];

// 發送SMS
	function SendSMS(NAME,SMSCODE,PHONE){
		const _UID  = '0972153032';
		const _PWD  = '5a33';
		const _MSG  = encodeURIComponent(NAME) + SMSCODE;
		const _DEST = PHONE;
		let _url  = 'https://oms.every8d.com/API21/HTTP/sendSMS.ashx?';
			_url += 'UID=' + _UID;
			_url += '&PWD=' + _PWD;
			_url += '&MSG=' + _MSG;
			_url += '&DEST=' + _DEST;
		return _url;
	};

// 註冊第一步
	Template.RegisterOfPhone.events({
		'click [name=sendcode]':(evt,tmp)=>{
			evt.preventDefault();
			let ropphone = tmp.$('[name=ropphone]').val();
			navigator.notification.confirm("",
				function (r) {
					switch (r) {
						case 0:
						case 2:
						break;
						case 1:
							ROPPhone.set(ropphone);
							let TmpSMSStr = Math.floor((Math.random() * 10000) + 1);
							const Name = "此信件為智慧點餐\n手機驗證碼為: ";
							const URL = SendSMS(Name,TmpSMSStr,ropphone);
							HTTP.get(URL,(error, result) => { if (!error) {}; });
							ROPStepCode.set(TmpSMSStr);
							tmp.$('[name=ropcode]').attr('disabled', false);
							tmp.$('[name=sendcode]').attr('disabled', true);
						break;
					}
				},
				"是否要發驗證碼給 " + ropphone + "\n" + "請確認號碼是否正確",
				['是發送與號碼正確', '取消']
			);
		},
		'change [name=ropcode]': (evt, tmp) => {
	        evt.preventDefault();
			const _userphone = evt.target.value;
			const _ROPStep   = ROPStepCode.get();
			if(_userphone == _ROPStep){
				evt.preventDefault();
				Router.go('post.RegisterOfAccount');
			};
	    },
		'change [name=ropphone]':(evt,tmp)=>{
	        evt.preventDefault();
	        tmp.$('[name=sendcode]').attr('disabled', true);
	        const _userphone = evt.target.value;
	        if(_userphone.length < 10) {
	            alert('手機碼不能小於10位數');
	            evt.target.value = '';
	        }else{
	        	Meteor.call('CheckPhone', _userphone,(err,res) => {
        			if(!res){
        				tmp.$('[name=sendcode]').attr('disabled', false);
        			}else{
        				alert("此手機號碼已註冊....");
        			};
	        	});
	        };
	    }
	});

// 註冊第二步Events
	Template.RegisterOfAccount.events({
		'submit form':(evt,tmp)=>{
			evt.preventDefault();
			
			let target 	 	  	= evt.target;
			let _ROPPhone 		= ROPPhone.get();
		    let _useremail 	  	= target.useremail.value;
		    let _SchoolSelect   = target.SchoolSelect.value;
		    let _IdentitySelect = target.IdentitySelect.value;
		    let _userpwd 		= "";
		    let _againuserpwd   = "";
		    const dateTime 	 = Date.now();
			const _timestamp = Math.floor(dateTime / 1000);
			const _Date  = new Date();
			const _Year  = _Date.getFullYear();
			const _Month = _Date.getMonth();
			const _Day   = _Date.getDate();
			let YMD	= [];
				YMD[0] = _Year;
				YMD[1] = _Month;
				YMD[2] = _Day;

		    let InsertObj = {
		    	users_to_id : '',
		    	user_accessType : 'FB',
			    user_school_mail_id : ((_useremail).toLowerCase()),
			    user_school_addess : _SchoolSelect,
			    user_school_identity : _IdentitySelect,
			    user_school_mail_check : 0,
			    timestamp : _timestamp,
			    notifi: [],
			    order: [],
			    import: {
			        phone : _ROPPhone,
			        status : 1,
			        token : '',
			        uuid : '',
			        platform : '',
			        date : new Date()
			    },
		    };

		    if(String(RegisterStep.get()) != "FB"){
				// 一般註冊
				_userpwd 	  = target.userpwd.value;
				_againuserpwd = target.againuserpwd.value;
				if(_ROPPhone){
					if((_useremail == "")){
						alert('學校信箱帳號不能為空...');
					}else{
						if((_SchoolSelect == "--選擇學校--")){
							alert('尚未選學校');
						}else{
							if((_IdentitySelect == "--選擇身份--")){
								alert('尚未選身份');
							}else{
								if((_IdentitySelect == "--選擇身份--")){
									alert('尚未選身份');
								}else{
									if((_userpwd == "")){
										alert('密碼不能為空');
									}else{
										if((_againuserpwd == "")){
											alert('密碼不能為空');
										}else{
											if(ROAStepCheck.get()){
												Accounts.createUser({
											        email: ((_ROPPhone + '@jnad1798.com').toLowerCase()),
											        password: _againuserpwd,
											        profile: {
											            createDate: new Date()
											        }
											    },(err)=> {
											        if(err){
											        	target.useremail.value = '';
											        	alert("此信箱已註冊");
											        }else{
											        	window.plugins.spinnerDialog.show("", "帳戶建立中..",true);
											        	InsertObj.user_accessType = "NoFB";
											        	InsertObj.users_to_id 	  = Meteor.userId();
											        	Meteor.call('CreateUseInfo', InsertObj, Meteor.userId() , _Year, YMD, _timestamp, 
											        		(err,res)=>{
											        			if(res){
											        				alert('註冊成功，請再次登入...');
											        				Meteor.logout();
											        				Router.go('post.login');
											        			};
											        		}
											        	);
											        };
											    });	
											};
										};
									};
								};
							};
						};
					};
				}else{
					alert('導向錯誤...');
					Router.go('post.login');
				};
			}else{
				if(_ROPPhone){
					if((_useremail == "")){
						alert('學校信箱帳號不能為空...');
					}else{
						if((_SchoolSelect == "--選擇學校--")){
							alert('尚未選學校');
						}else{
							if((_IdentitySelect == "--選擇身份--")){
								alert('尚未選身份');
							}else{
								if((_IdentitySelect == "--選擇身份--")){
									alert('尚未選身份');
								}else{
									window.plugins.spinnerDialog.show("", "帳戶建立中..",true);
						        	InsertObj.users_to_id = Meteor.userId();
						        	Meteor.call('CreateUseInfo', InsertObj, Meteor.userId() , _Year, YMD, _timestamp, 
						        		(err,res)=>{
						        			if(res){
						        				alert('註冊成功，請再次登入...');
						        				Router.go('post.login');
						        			};
						        		}
						        	);
								};
							};
						};
					};
				}else{
					alert('導向錯誤...');
					Router.go('post.login');
				};
			};
		}, 
		'change [name=userpwd]': (evt, tmp) => {
	        evt.preventDefault();
	        let _userpwd = evt.target.value;
	       	if(_userpwd.length < 10) {
	            alert('密碼不能小於10位');
	            evt.target.value = '';
	        };
	    },
		'change [name=againuserpwd]': (evt, tmp) => {
	        evt.preventDefault();
	        let _againuserpwd = evt.target.value;
	        if(_againuserpwd.length < 10) {
	            alert('密碼不能小於10位');
	            evt.target.value = '';
	        }else{
	        	if(tmp.$('[name=userpwd]').val() != _againuserpwd){
		        	alert("密碼不相同");
		        	evt.target.value = '';
		        }else{
		        	ROAStepCheck.set(1);
		        };
	        };
	    }
	});

// 註冊第二步Helpers
	Template.RegisterOfAccount.helpers({
		enroll(){
			if(String(RegisterStep.get()) != "FB"){
				return 1;
			}else{
				return 0;
			}
		},
	});

// Forget
	Template.Forget.events({
		'click [name=emailgo]': (evt, tmp) => {
	        evt.preventDefault();
	        const _schoolemail = ((tmp.$('[name=schoolemail]').val()).toLowerCase());
	        if(_schoolemail == ""){
	        	alert("學校信箱不能為空...");
	        }else{
	        	const _Mongo_UserInfo = Mongo_UserInfo.find({
							        		'user_school_mail_id': _schoolemail
							        	}).fetch();
	        	
	        	if( (_Mongo_UserInfo != "") ){

	        		_Mongo_UserInfo.forEach((elem, index)=>{
	        			if( (elem.user_accessType == "FB")){
	        				alert("--FB登入--\n無法更新密碼");
	        				Router.go('post.login');
	        			}else{
	        				let TmpSMSStr = Math.floor((Math.random() * 10000) + 1);
							let _phone 	= elem.import.phone;

							const Name  = "此信件為忘記密碼\n手機驗證碼為: ";
							const URL 	= SendSMS(Name,TmpSMSStr,_phone);

							tmp.$('[name=checkemail]').attr('disabled', false);
							tmp.$('[name=emailgo]').attr('disabled', true);
							Session.set('MeteorID',elem.users_to_id);

							HTTP.get(URL,(error, result) => { if (!error) {}; });
							ForgetCode.set(TmpSMSStr);
	        			};
	        		});
	        	}else{
	        		tmp.$('[name=schoolemail]').val('');
					alert("資訊錯誤...");
	        	}
	        };
	    },
	    'change [name=checkemail]': (evt, tmp) => {
	        evt.preventDefault();
			const _checkemail = evt.target.value;
			const _ForgetCode = ForgetCode.get();
			if(_checkemail == _ForgetCode){
				evt.preventDefault();
				evt.target.value = '';
				alert('驗證對...');
				Router.go('post.FormatPwd');
			};
	    },
	});

// 重置密碼
	Template.FormatPwd.events({
		'click [name=BtnFormat]':(evt,tmp)=>{
			const _MeteorID = Session.get('MeteorID');
			const _ReNewPwd = tmp.$('[name=ReNewPwd]').val();
			if(ReNewPwdCode.get()){
				navigator.notification.confirm("",
					function (r) {
						switch (r) {
							case 0:
							case 1:
							break;
							case 2:
								Meteor.call('ReSetPwd',_MeteorID,_ReNewPwd,
									(err,res) => {
										if(res){
											alert("密碼已更新...");
											Router.go('post.login');
										};
								});
							break;
						}
					},
					"確定要重置密碼",
					['取消', '重置']
				);
		   	}else{
		   		alert("資訊不對等...");
		   	};
		},
		'change [name=NewPwd]':(evt,tmp)=>{
			evt.preventDefault();
	        let _NewPwd = evt.target.value;
	       	if( _NewPwd.length < 10 ) {
	            alert('密碼不能小於10位');
	            evt.target.value = '';
	        };
		},
		'change [name=ReNewPwd]':(evt,tmp)=>{
			evt.preventDefault();
	        let _ReNewPwd = evt.target.value;
	        if(_ReNewPwd.length < 10) {
	            alert('密碼不能小於10位');
	            evt.target.value = '';
	        }else{
	        	if(tmp.$('[name=NewPwd]').val() != _ReNewPwd){
		        	alert("密碼不相同");
		        	evt.target.value = '';
		        }else{
		        	ReNewPwdCode.set(1);
		        };
	        };
		},
	});

// 會員專區之意見反饋
	Template.Comment.events({
		'click [name=BtnComment]':(evt,tmp)=>{
			evt.preventDefault();
			const _contents = tmp.$('[name=contents]').val();
			if(_contents.length <= 0 ){
				alert("反饋與建議不能為空...");
			}else{
				navigator.notification.confirm("",
					function (r) {
						switch (r) {
							case 0:
							case 1:
							break;
							case 2:
								window.plugins.spinnerDialog.show("", "反饋傳送中...",true);
								Meteor.call('UserComment',Meteor.userId(),_contents,
									(err,res)=>{
										if(res){
											alert("感謝您的反饋與建議...");
											Router.go('post.MainTmp');
										};
								});	
							break;
						}
					},
					"確定要給予反饋與建議",
					['取消', '確定']
				);
			};
		},
	});

// 會員專區之信箱驗證
	Template.MemberOfMail.events({
		'click [name=BtnMailLink]':(evt,tmp)=>{
			evt.preventDefault();
			window.plugins.spinnerDialog.show("", "校園驗證碼傳送中...",true);
			const _Mail = tmp.$('[name=Mail]').val();
			const _Mongo_UserInfo = Mongo_UserInfo.find({
										'users_to_id': Meteor.userId()
									}).fetch();

			_Mongo_UserInfo.forEach((elem, index)=>{
				Meteor.call('RegisterEmail',
					elem.user_school_mail_id,elem.user_school_identity,_Mail,Meteor.userId(),
					(err,res)=>{
						if(res){
							alert('請到學生信箱點擊驗證碼...');
							Router.go('post.Member');
						};
					}
				);
			});
		},
	});

// 會員專區之更換手機號碼
	Template.MemberOfchangePhone.onRendered(function(){
		const UIF = Mongo_UserInfo.find({
				'users_to_id': Meteor.userId()
			}).fetch();

		UIF.forEach((elem, index)=>{
			if(elem.user_accessType == "FB"){
				alert("--FB登入--\n無法更換電話...");
				Router.go('post.Member')
			}
		});
	});

	Template.MemberOfchangePhone.events({
		'click [name=TransferPhone]':(evt,tmp)=>{
			evt.preventDefault();

			const ChangePhone = tmp.$('[name=ChangePhone]').val();
			const _oldPhone = Mongo_UserInfo.findOne({
										'users_to_id': Meteor.userId()
									}).import.phone;

			const _newemail = ChangePhone + '@jnad1798.com';
			const _oldemail = _oldPhone + '@jnad1798.com';
			Meteor.call('ChangePhone', Meteor.userId(), _oldemail, _newemail, ChangePhone,
				(err,res)=>{
					if(res){
						alert("手機更換已完成!!!");
						Meteor.logout();
						Router.go('post.login');
					};
			});

		},
		'click [name=BtnChangePhone]':(evt,tmp)=>{
			evt.preventDefault();
			const ChangePhone = tmp.$('[name=ChangePhone]').val();
			navigator.notification.confirm("",
				function (r) {
					switch (r) {
						case 0:
						case 2:
						break;
						case 1:
							let TmpSMSStr = Math.floor((Math.random() * 10000) + 1);
							const Name = "此信件為智慧點餐\n手機帳號更換驗證碼為: ";
							const URL = SendSMS(Name,TmpSMSStr,ChangePhone);
							HTTP.get(URL,(error, result) => { if (!error) {}; });
							ROPStepCode.set(TmpSMSStr);
							tmp.$('[name=ChangePhoneCode]').attr('disabled', false);
							tmp.$('[name=BtnChangePhone]').attr('disabled', true);
						break;
					}
				},
				"是否要發驗證碼給 " + ChangePhone + "\n" + "請確認號碼是否正確",
				['是發送與號碼正確', '取消']
			);
		},
		'change [name=ChangePhoneCode]': (evt, tmp) => {
	        evt.preventDefault();
			const _userphone = evt.target.value;
			const _ROPStep   = ROPStepCode.get();
			if(_userphone == _ROPStep){
				evt.preventDefault();
				alert("驗證已成功\n點擊[進行轉換]即可立即更新...");
				tmp.$('[name=ChangePhone]').attr('disabled', true);
				tmp.$('[name=ChangePhoneCode]').attr('disabled', true);
				tmp.$('[name=TransferPhone]').attr('disabled', false);
			};
	    },
		'change [name=ChangePhone]':(evt,tmp)=>{
			evt.preventDefault();
			let _ChangePhone = evt.target.value;
	       	if( _ChangePhone.length < 10 ) {
	            alert('手機碼不能小於10碼');
	            evt.target.value = '';
	        }else{
	        	tmp.$('[name=BtnChangePhone]').attr('disabled', true);
	        	Meteor.call('CheckPhone',_ChangePhone,(err,res) => {
        			if(!res){
        				tmp.$('[name=BtnChangePhone]').attr('disabled', false);
        			}else{
        				alert("此手機號碼已註冊....");
        			};
	        	});
	        };
		},
	});

// 會員專區
	Template.Member.events({
		'click [name=Notification]':(evt,tmp)=>{
			evt.preventDefault();
			alert("準備好接收通知...");
		},
		'click [name=Mail]':(evt,tmp)=>{
			evt.preventDefault();
			Router.go('post.MemberOfMail');
		},
		'click [name=changePhone]':(evt,tmp)=>{
			evt.preventDefault();
			Router.go('post.MemberOfchangePhone');
		},
		'click [name=Comment]':(evt,tmp)=>{
			evt.preventDefault();
			Router.go('post.Comment');
		},
		'click [name=Rule]':(evt,tmp)=>{
			evt.preventDefault();
			Router.go('post.Rule');
		},
		'click [name=LogOut]':(evt,tmp)=>{
			evt.preventDefault();
			navigator.notification.confirm("",
				function (r) {
					switch (r) {
						case 0:
						case 1:
						break;
						case 2:
							Meteor.call('UpToken',Meteor.userId());
							Meteor.logout();
							Router.go('post.login');
						break;
					}
				},
				"確定要登出??",
				['取消', '確定']
			);
		},
	});

// 菜單
	function Fun_SingleFood(coll_id){

		const _Mongo_ShopSingleFood = Mongo_ShopSingleFood.find({
										'SingleMenu_id': coll_id
									}).fetch();

		_Mongo_ShopSingleFood.forEach(function(elem,index){
			
			const _elem_surplus = (elem.surplus).length;

			if(_elem_surplus >= 5){

				let _name = elem.zh;
				_type = elem.type.none;
				if((elem.type.none == 0)){
					let hot  = (elem.type.hot == 1)?"(熱)":"";
					let cool = (elem.type.cool == 1)?"(冷)":"";
					let max  = hot + '' + cool;
					let _type = elem.type.hot + elem.type.cool;
					_name += max;
				};

				MeteorEach.push({
					objid: elem._id,
					name: _name,
					money: ('NT$' + elem.money),
					surplus: (elem.surplus).length
				});

			};
		});
	};

	function Fun_DoubleFood(){
		const _Mongo_ShopDoubleFood = Mongo_ShopDoubleFood.find({}).fetch();

		_Mongo_ShopDoubleFood.forEach(function(SDFelem,SDFindex){
			
			const SSF = Mongo_ShopSingleFood.find({
										'_id': SDFelem.Sigleid
									}).fetch();

			SSF.forEach((elem, index)=>{
				const _elem_surplus = (elem.surplus).length;

				if(_elem_surplus >= 5){

					MeteorEach.push({
						objid: SDFelem._id,
						name: SDFelem.zh,
						surplus: _elem_surplus
					});

				};
			});
		});
	};

	var VarChoose = new ReactiveVar(0);
	var VarSingle_Double = new ReactiveVar(0);
	var VarSingle_Food   = new ReactiveVar(0);

	Template.order.events({
		'change [name=Choose]':(evt,tmp)=>{
			evt.preventDefault();
			const _shopChoose = tmp.$('[name=Choose]').val();
			if("--選擇餐點類別--" != _shopChoose){
				VarChoose.set(_shopChoose);
				
			};
		},
		'change [name=SelSingleFood]':(evt,tmp)=>{
			evt.preventDefault();
			const SelSingleFood = tmp.$('[name=SelSingleFood]').val();
			VarSingle_Double.set(1); // 1 為選單點
			VarSingle_Food.set(SelSingleFood);
		},
		'click .cartremove':(evt,tmp)=>{
			evt.preventDefault();

			let RmCart = [];
			const datasetNumber = evt.currentTarget.dataset.value;
			const CARTTmpArray = Session.get('CART');
			navigator.notification.confirm("",
				function (r) {
					switch (r) {
						case 0:
						case 1:
						break;
						case 2:
							CARTTmpArray.reverse();
							CARTTmpArray.forEach(function(elem,index){
								if(datasetNumber != index){
									RmCart.push(elem);
								}else{
									const _elem = elem[0];
									if(_elem.type == "single"){
										Meteor.call('SinglePush', _elem.foodid);
									}else{
										Meteor.call('DobulePush', _elem.dd.singlefoodid);
										Meteor.call('DobulePush', _elem.dv.dvobjid);
										const SDF = Mongo_ShopDoubleFood.find({
													'_id': (_elem.df.objid)
												}).fetch();
										SDF.forEach((elem, index)=>{
											Meteor.call('DobulePush', elem.Sigleid);
										});
									};
								};
							});
							Session.set('CART',RmCart);
						break;
					}
				},
				"確定要刪除",
				['取消', '刪除']
			);
		},
		'click [name=CartBuy]':(evt,tmp)=>{
			evt.preventDefault();
			let TmpArray = [];

			const CARTTmpArray = Session.get('CART');
			CARTTmpArray.forEach(function(elem,index){
				TmpArray.push(elem[0]);
			});

			const _UsersId = Meteor.userId();
			const dateTime 	 = Date.now();
			const _timestamp = Math.floor(dateTime / 1000);
			const _shopid = Session.get('objid');
			const _total = CartMoney.get();
			
			const data = {
				users_to_id: _UsersId,
				foodlist: TmpArray,
				money: _total,
				timestamp: _timestamp,
				date: new Date()
			};
			navigator.notification.confirm("",
				function (r) {
					switch (r) {
						case 0:
						case 2:
						break;
						case 1:
							navigator.notification.confirm("",
								function (r) {
									switch (r) {
										case 0:
										case 2:
										break;
										case 1:
											window.plugins.spinnerDialog.show("", "下單進行中...",true);
											Meteor.call('CartToInsert', _shopid, _UsersId, data, _timestamp, 
												(err,res)=>{
													if(res){
														alert("完成下單，請等候商家受理.....");
														alert("!!留意商家!!\n\n--通知(推播)--");
														Session.set('CART',"undefined");
														CartMoney.set(0);
														Router.go('post.Record', {_id: 1}, {query: 'type=0'});
													};
												}
											);
										break;
									}
								},
								"確定要下單",
								['確定', '取消']
							);
						break;
					}
				},
				"--是否同意--\n訂單受理後無法藉由\n此訂單\n(增加餐點 / 修正餐點)",
				['同意', '不同意']
			);
		},
	});

	var ShopObjId = new ReactiveVar(0);
	var OpenSingleList = new ReactiveVar(0);
	var OpenCart  = new ReactiveVar(0);
	var CartMoney = new ReactiveVar(0);
	var Cart = [];

	// 商品Push
		function AutoPush(){
			// SinglePush
			const _PushSingleObjId = SinglePullPush.get();
			if( (_PushSingleObjId != 0) ){
				Meteor.call('SinglePush', _PushSingleObjId, (err,res)=>{
					if(res){
						SinglePullPush.set(0);
					};
				});
			};

			// DoubleFoodPush
			const _PushDobuleFoodObjId = DobuleFoodPullPush.get();
			if( (_PushDobuleFoodObjId != 0) ){
				Meteor.call('DobulePush', _PushDobuleFoodObjId, (err,res)=>{
					if(res){
						DobuleFoodPullPush.set(0);
					};
				});
			};

			// DoubleVicePush
			const _DobuleVicePullPush = DobuleVicePullPush.get();
			if( (_DobuleVicePullPush != 0) ){
				Meteor.call('DobulePush', DobuleVicePullPush.get(), (err,res)=>{
					if(res){
						DobuleVicePullPush.set(0);
					};
				});
			};

			// DoubleDirnkPush
			const _DobuleDrinkPullPush = DobuleDrinkPullPush.get();
			if( (_DobuleDrinkPullPush != 0) ){
				Meteor.call('DobulePush', _DobuleDrinkPullPush, (err,res)=>{
					if(res){
						DobuleDrinkPullPush.set(0);
					};
				});
			};
		};

	Template.order.onRendered(function(){
		// 商品 Push 
		AutoPush();
	});

	Template.order.helpers({
		security(){
			let open = 0;
			const _UIF = Mongo_UserInfo.find({'users_to_id': Meteor.userId()}).fetch();
			
			_UIF.forEach((elem, index)=>{
				open = elem.user_school_mail_check;
			});

			return open;
		},
		CartSingleOrDouble(OpenOrClose){
			return OpenOrClose;
		},
		CartList(){
			MeteorEach = [];

			Cart = [];

			let TotalMoney = 0;
			
			let CartCount = 0;
			
			const CARTTmpArray = Session.get('CART');
			
			CARTTmpArray.forEach(function(elem,index){
				Cart.push(elem);
			});

			Cart.reverse();
			Cart.forEach(function(elem, index){
				let _elem0 = elem[0];
				
				CartCount++;

				if(_elem0.type == "single"){
					const SSF = Mongo_ShopSingleFood.find({
								'_id': _elem0.foodid
							}).fetch();

					SSF.forEach(function(SSFelem,SSFindex){
						const SSM = Mongo_ShopSingleMenu.find({
										'_id': SSFelem.SingleMenu_id
									}).fetch();

						SSM.forEach(function(SSMelem,SSMindex){
							const _elem0_FSid = _elem0.foodsauceid.split(',');
							let _sauce = "";
							_elem0_FSid.forEach(function(FSidelem,FSidindex){
								const FS = Mongo_FoodSauce.find({
												'_id': FSidelem
											}).fetch();

								FS.forEach(function(FSelem,FSindex){
									_sauce += FSelem.zh;
									if(FSidindex < (_elem0_FSid.length - 1)){
										_sauce += ',';
									};
								});

							});

							MeteorEach.push({
								SingleOrDouble: 1, // 1=單點 ,0=套餐
								head: CartCount+'.'+_SingleOrDouble[1],
								catena: "" + SSMelem.zh + "系列",
								name: "" + _elem0.foodname,
								sauce: "" + _sauce,
								money: "NT$ " + SSFelem.money,
								path: index
							});
							TotalMoney += parseInt(SSFelem.money);
						});
					});
				}else{
					const _elem0_df = _elem0.df; // 主餐
					const _elem0_dv = _elem0.dv; // 副餐
					const _elem0_dd = _elem0.dd; // 飲品 濃湯
					const _elem0_st = _elem0.st; // 原味 糖 冰塊

					// 主食 主食甜品 價錢 
					const First_SDF = Mongo_ShopDoubleFood.find({
											'_id': _elem0_df.objid
										}).fetch();
											
					First_SDF.forEach(function(FSDFelem,FSDFindex){
						const First_SSF = Mongo_ShopSingleFood.find({
											'_id': FSDFelem.Sigleid
										}).fetch();

						First_SSF.forEach(function(FSSFelem,FSSFindex){
							const First_SSM = Mongo_ShopSingleMenu.find({
										'_id': FSSFelem.SingleMenu_id
									}).fetch();

							First_SSM.forEach(function(FSSMelem,FSSMindex){
								// 副餐
								const Second_SSF = Mongo_ShopSingleFood.find({
													'_id': _elem0_dv.dvobjid
												}).fetch();

								Second_SSF.forEach(function(SSSFelem,SSSFindex){
									const Second_FS = Mongo_FoodSauce.find({
													'_id': _elem0_dv.sauceid
												}).fetch();

									Second_FS.forEach(function(SFSelem,SFSindex){
										// 飲品
										const dirnkName = Mongo_ShopSingleFood.find({
															'_id': _elem0_dd.singlefoodid
														}).fetch();

										dirnkName.forEach(function(DNelem,DNindex){
											let TmpSauce = " (";
											
											_elem0_st.forEach(function(STelem,STindex){
												const drink_sauce = Mongo_FoodSauce.find({
																		'_id': STelem.sauceid
																	}).fetch();

												drink_sauce.forEach(function(Dselem,Dsindex){
													TmpSauce += Dselem.zh;
													if(STindex < (_elem0_st.length - 1)){
														TmpSauce += ',';
													};
												});
											});

											TmpSauce += ')';

											MeteorEach.push({
												SingleOrDouble: 0, // 1=單點 ,0=套餐
												head: CartCount+'.'+_SingleOrDouble[0],
												meal: _elem0_df.title,
												first: FSSFelem.zh + '('+ _elem0_df.sauce +')',
												second: SSSFelem.zh + '('+ SFSelem.zh +')',
												drink: DNelem.zh + TmpSauce,
												money: "NT$ " + _elem0_df.money,
												path: index
											});

											TotalMoney += parseInt(_elem0_df.money);
										});
									});
								});
							});
						});
					});
				};
			});

			CartMoney.set(TotalMoney);
			return MeteorEach;
		},
		CarMoney(){
			return CartMoney.get();
		},
		retenCart(){
			Cart = [];
			let CARTTmpArray = Session.get('CART');

			// const backMeun = Session.get('objid');
			if(String(CARTTmpArray) != "undefined"){
				CARTTmpArray.forEach(function(elem,index){
					Cart.push(elem);
				});
			};

			const _cartlen = Cart.length;
			if(_cartlen < 1){
				OpenCart.set(0);
			}else{
				OpenCart.set(1);
			};
		},
		EmptyOrder(){
			return OpenCart.get();
		},
		InitOrder(){
			OpenSelType.set(0);
			VarChoose.set(0);
			VarSingle_Food.set(0);
		},
		IFChoose(){
			ShopObjId.set(this['objid']);
			Session.set('objid',this['objid']);

			VarSingle_Double.set(0); // init
			if(VarChoose.get() == "single"){
				return 1;
			}else if(VarChoose.get() == "double"){
				VarSingle_Double.set(2); // 2 為選套餐
			}else{}
		},
		SingleDoubleList(){
			MeteorEach = [];
			
			H_window = $(window).height();
			switch(VarSingle_Double.get()){
				case 1:
					Fun_SingleFood(VarSingle_Food.get());
					$("#SDL").css({'max-height': (H_window - 282) }).scrollTop(0);
					OpenSingleList.set(1);
				break;
				case 2:
					Fun_DoubleFood();
					$("#SDL").css({'max-height': (H_window - 237) }).scrollTop(0);
					OpenSingleList.set(0);
				break;
			};
			
			return MeteorEach;
		},
		SignleList(){
			return OpenSingleList.get();
		},
	});

// 點餐資訊
	Template.foodorder.onRendered(function () {
		const H = $(document).height();
		$("#foodorderbody").css({ "height" : (H - 130) });
	});
	
	var foodordertitle = new ReactiveVar('資料錯誤');
	var foodordermoney = new ReactiveVar(0);

	var DFVice  = new ReactiveVar(0);
	var DFDrink = new ReactiveVar(0);

	var OpenSelType = new ReactiveVar(0);

	var RvSF = new ReactiveVar(0); 
	var RvDF = new ReactiveVar(0);
	var RvDV = new ReactiveVar(0);
	var RvDD = new ReactiveVar(0);
	var RvST = new ReactiveVar(0);

	Template.foodorder.helpers({
		SelType(){
			let _RvDD  = RvDD.get();
			
			MeteorEach = [];
			
			if(_RvDD != 0){
				
				let _RvDD0 = _RvDD[0].singlefoodid;
				
				const _Mongo_ShopSingleFood = Mongo_ShopSingleFood.findOne({
												'_id': _RvDD0
											});
				const SSFSauce = _Mongo_ShopSingleFood.sauce;

				if( _Mongo_ShopSingleFood.type.none == 1 ){
					SSFSauce.forEach(function(elem, index){
						const _Mongo_FoodSauce = Mongo_FoodSauce.findOne({
													'_id': elem.sauce
												});
						if( (_Mongo_FoodSauce != "null") && (_Mongo_FoodSauce.status == 1) ){
							MeteorEach.push({
								STindex: index,
								STname: _Mongo_FoodSauce.zh,
								STsauceid: elem.sauce
							});
						};
					});
				}else{
					const temperature = ['hot','cool'];
					// 飲料類 hot or cool 少於等於 1
					if(((SSFSauce).length) <= 1){
						SSFSauce.forEach(function(SSelem1,SSindex){
							temperature.forEach(function(Telem,Tindex){
								if(String(SSelem1[Telem]) != "undefined"){
									const SST = SSelem1[Telem];
									SST.forEach(function(SSTelem,SSTindex){
										
										const _Mongo_FoodSauce = Mongo_FoodSauce.findOne({
																	'_id': (SSTelem[Telem])
																});

										if(String(_Mongo_FoodSauce) != "undefined"){
											if(_Mongo_FoodSauce.status){

												SauseArray = []

												SauseArray.push(SSTelem[Telem]);

												MeteorEach.push({
													STindex: SSTindex,
													STname: _Mongo_FoodSauce.zh,
													STsauceid: SauseArray.toString()
												});

												$('#STRadius' + SSTindex).css({
													"background-color": "#f7efea"
												});
											};
										};

									});
								};
							});
						});
					}else{
						let TwoHotCool = 0;
						for(let i=0; i<(SSFSauce[0][temperature[0]]).length; i++){

							let SSTHot = ((((SSFSauce[0][temperature[0]])[i]))[temperature[0]]);
								
							const _Mongo_FoodSauce_SSTHot = Mongo_FoodSauce.findOne({
																'_id': SSTHot
															});

							for(let j=0; j<(SSFSauce[1][temperature[1]]).length; j++){
								
								let SSTCool = ((((SSFSauce[1][temperature[1]])[j]))[temperature[1]]);
									
								const _Mongo_FoodSauce_SSTCool = Mongo_FoodSauce.findOne({
																	'_id': SSTCool
																});
								let name = "";

								if(String(_Mongo_FoodSauce_SSTHot) != "undefined"){
									if( (_Mongo_FoodSauce_SSTHot.status) ){
										
										if(String(_Mongo_FoodSauce_SSTCool) != "undefined"){
											if( (_Mongo_FoodSauce_SSTCool.status) ){
												
												SauseArray = []

												SauseArray.push(_Mongo_FoodSauce_SSTCool._id);
												SauseArray.push(_Mongo_FoodSauce_SSTHot._id);

												name  = _Mongo_FoodSauce_SSTHot.zh + ',';
												name += _Mongo_FoodSauce_SSTCool.zh;

												MeteorEach.push({
													STindex: TwoHotCool,
													STname: name,
													STsauceid: SauseArray.toString()
												});

												$('#STRadius' + TwoHotCool).css({
													"background-color": "#f7efea"
												});

											};
										};

									};
								};

								TwoHotCool++;
							};
						};
					};
				};

			};
			return MeteorEach;
		},
		DoubleFood(objid){
			
			foodordermoney.set(0);

			Session.set('DFfoodtitle',objid);

			const _Mongo_ShopDoubleFood = Mongo_ShopDoubleFood.find({
											'_id': objid
										});
			MeteorEach = [];
			_Mongo_ShopDoubleFood.forEach(function(elem,index){
				foodordertitle.set(elem.zh);
				const _elem_sauce = elem.sauce;
				_elem_sauce.forEach(function(ESelem,ESindex){
					const _Mongo_FoodSauce = Mongo_FoodSauce.findOne({
												'_id': ESelem.foodsauceid
											});
					if( (_Mongo_FoodSauce != "null") && 
						(_Mongo_FoodSauce.status == 1)) {

						MeteorEach.push({
							DFindex: ESindex,
							DFname: _Mongo_FoodSauce.zh,
							DFmoney: ESelem.money,
							DFsauceid: _Mongo_FoodSauce._id
						});
					};
				});

				DFVice.set(elem.vice);
				DFDrink.set(elem.drink);
			});
			return MeteorEach;
		},
		DoubleVice(){
			const _DFVice = DFVice.get();
			
			MeteorEach = [];
			
			let DVcount = 0;

			_DFVice.forEach(function(elem,index){
				const _Mongo_ShopSingleFood = Mongo_ShopSingleFood.findOne({
												'_id': elem.vice
											});

				const SSFSurplus_length = (_Mongo_ShopSingleFood.surplus).length;

				if(SSFSurplus_length >= 5){

					const SSFSauce = _Mongo_ShopSingleFood.sauce;
				
					SSFSauce.forEach(function(SSFelem,SSFindex){
						const _Mongo_FoodSauce = Mongo_FoodSauce.findOne({
													'_id': SSFelem.sauce
												});
						if( (_Mongo_FoodSauce != "null") && 
							(_Mongo_FoodSauce.status == 1) ){
							const _DVname = (_Mongo_ShopSingleFood.zh + '('+ _Mongo_FoodSauce.zh +')');
							MeteorEach.push({
								DVindex: DVcount,
								DVid: elem.vice,
								DVname: _DVname,
								DVsauceid: _Mongo_FoodSauce._id
							});
							DVcount++;
						};
					});

				};

			});
			return MeteorEach;
		},
		DoubleDirnk(){
			const _DDrink = DFDrink.get();

			MeteorEach = [];

			const _DDDrinkSoup 	   = _DDrink[0].soup;
			const _DDDrinkBeverage = _DDrink[1].beverage;
			
			let DDcount = 0;

			if( _DDDrinkSoup.length >= 1 ){
				_DDDrinkSoup.forEach(function(elem, index){
					const _ShopSingleFood = Mongo_ShopSingleFood.findOne({
												'_id': elem.sauceid
											});
					const SSFZh = _ShopSingleFood.zh;
					const SSFSurplus_length = (_ShopSingleFood.surplus).length;

					if(SSFSurplus_length >= 5){
						MeteorEach.push({
							DDindex: DDcount,
							DDname: SSFZh,
							DDsauceid: elem.sauceid
						});
						DDcount++;
					};

				});
				
			};

			if( _DDDrinkBeverage.length >= 1 ){
				
				_DDDrinkBeverage.forEach(function(elem, index){
					const _ShopSingleFood = Mongo_ShopSingleFood.findOne({
												'_id': elem.sauceid
											});
					const SSFZh = _ShopSingleFood.zh;
					const SSFSurplus_length = (_ShopSingleFood.surplus).length;

					if(SSFSurplus_length >= 5){

						MeteorEach.push({
							DDindex: DDcount,
							DDname: SSFZh,
							DDsauceid: elem.sauceid
						});
						DDcount++;	

					};
					
				});

			};

			return MeteorEach;
		},
		DoubleSingle(){
			return OpenSingleList.get();
		},
		SignleFood(objid){
			Session.set('SFfoodtitle',objid);
			SaveFood = [];
			const _Mongo_ShopSingleFood = Mongo_ShopSingleFood.find({
											'_id': objid
										}).fetch();
			
			MeteorEach 	   = [];
			let SauseArray = [];

			_Mongo_ShopSingleFood.forEach(function(elem,index){
				
				foodordertitle.set(elem.zh);
				foodordermoney.set(elem.money);
				const SingleSauce = elem.sauce;

				if(elem.type.none == 1){
					SingleSauce.forEach(function(Selem1,Sindex){
						const _Mongo_FoodSauce = Mongo_FoodSauce.findOne({
													'_id':Selem1.sauce
												});

						if(String(_Mongo_FoodSauce) != "undefined"){
							if(_Mongo_FoodSauce.status){

								SauseArray = [];

								SauseArray.push(_Mongo_FoodSauce._id);

								MeteorEach.push({
									index: Sindex,
									objid: elem._id,
									name: _Mongo_FoodSauce.zh,
									money: elem.money,
									sauceid: SauseArray.toString()
								});
							};
						};

					});
				}else{
					const temperature = ['hot','cool'];
					// let temperatureTmp = "";
					
					// 飲料類 hot or cool 少於等於 1
					if(((SingleSauce).length) <= 1){
						
						SingleSauce.forEach(function(SSelem1,SSindex){
							temperature.forEach(function(Telem,Tindex){
								if(String(SSelem1[Telem]) != "undefined"){
									const SST = SSelem1[Telem];
									SST.forEach(function(SSTelem,SSTindex){
										
										const _Mongo_FoodSauce = Mongo_FoodSauce.findOne({
																	'_id': (SSTelem[Telem])
																});

										if(String(_Mongo_FoodSauce) != "undefined"){
											if(_Mongo_FoodSauce.status){

												SauseArray = [];

												SauseArray.push(_Mongo_FoodSauce._id);

												MeteorEach.push({
													index: SSTindex,
													objid: elem._id,
													name: _Mongo_FoodSauce.zh,
													sauceid: SauseArray.toString()
												});
											};
										};

									});
								};
							});
						});
					}else{
						let TwoHotCool = 0;
						for(let i=0; i<(SingleSauce[0][temperature[0]]).length; i++){

							let SSTHot = ((((SingleSauce[0][temperature[0]])[i]))[temperature[0]]);
								
							const _Mongo_FoodSauce_SSTHot = Mongo_FoodSauce.findOne({
																'_id': SSTHot
															});

							for(let j=0; j<(SingleSauce[1][temperature[1]]).length; j++){
								
								let SSTCool = ((((SingleSauce[1][temperature[1]])[j]))[temperature[1]]);
									
								const _Mongo_FoodSauce_SSTCool = Mongo_FoodSauce.findOne({
																	'_id': SSTCool
																});
								let name = "";

								if(String(_Mongo_FoodSauce_SSTHot) != "undefined"){
									if( (_Mongo_FoodSauce_SSTHot.status) ){
										
										if(String(_Mongo_FoodSauce_SSTCool) != "undefined"){
											if( (_Mongo_FoodSauce_SSTCool.status) ){
												
												SauseArray = []

												SauseArray.push(_Mongo_FoodSauce_SSTCool._id);
												SauseArray.push(_Mongo_FoodSauce_SSTHot._id);

												name  = _Mongo_FoodSauce_SSTHot.zh + ',';
												name += _Mongo_FoodSauce_SSTCool.zh;

												MeteorEach.push({
													index: TwoHotCool,
													objid: elem._id,
													name: name,
													sauceid: SauseArray.toString()
												});
											};
										};

									};
								};

								TwoHotCool++;
							};
						};
					};
				};

			});

			return MeteorEach;
		},
		money(){
			return foodordermoney.get();
		},
		title(){
			return foodordertitle.get();
		},
		IFSelType(){
			return OpenSelType.get();
		},
	});
	
	var SinglePullPush = new ReactiveVar(0);

	var DobuleFoodPullPush  = new ReactiveVar(0);
	var DobuleVicePullPush  = new ReactiveVar(0);
	var DobuleDrinkPullPush = new ReactiveVar(0);

	Template.foodorder.events({
		'click .STTmp':(evt,tmp)=>{
			evt.preventDefault();

			const datasetNumber = evt.currentTarget.dataset.value;
			const _Old_STRadius = Session.get('Old_STRadius');

			if( (String(_Old_STRadius) != "undefined") ){
				$('#STRadius' + _Old_STRadius).css({
					"background-color": "#f7efea"
				});
				RvST.set(0);
			};

			$('#STRadius' + datasetNumber).css({
				"background-color": "red"
			});

			const _STsauceid = tmp.$('[name=STsauceid' + datasetNumber + ']').val();

			const _STsauceid_split = _STsauceid.split(',');

			let STsaucesplit = [];
			_STsauceid_split.forEach(function(elem,index){
				STsaucesplit.push({
					sauceid: elem
				});
			});

			RvST.set(STsaucesplit);
			Session.set('Old_STRadius',datasetNumber);
		},
		'click .DDTmp':(evt,tmp)=>{
			evt.preventDefault();
			
			const datasetNumber = evt.currentTarget.dataset.value;
			const _Old_DDRadius = Session.get('Old_DDRadius');

			if( (String(_Old_DDRadius) != "undefined") ){
				$('#DDRadius' + _Old_DDRadius).css({
					"background-color": "#f7efea"
				});
				Meteor.call('DobulePush', DobuleDrinkPullPush.get(), 
					(err,res)=>{
						if(res){
							DobuleDrinkPullPush.set(0);
						};
				});
			};

			$('#DDRadius' + datasetNumber).css({
				"background-color": "red"
			});

			const _DDsauceid = tmp.$('[name=DDsauceid' + datasetNumber + ']').val();

			// const _DDsauceid_split = _DDsauceid.split(',');

			let DDsaucesplit = [];
			// _DDsauceid_split.forEach(function(elem,index){
				DDsaucesplit.push({ 
					singlefoodid: _DDsauceid 
				});
			// });

			// Pull Dobule Surplus
			if( !(DobuleDrinkPullPush.get()) ){
				Meteor.call('DobulePull', _DDsauceid, (err,res)=>{
					if(res){
						DobuleDrinkPullPush.set(_DDsauceid);
					};
				});
			};

			RvDD.set(DDsaucesplit);
			Session.set('Old_DDRadius',datasetNumber);
			OpenSelType.set(1);
		},
		'click .DVTmp':(evt,tmp)=>{
			evt.preventDefault();
			
			const datasetNumber = evt.currentTarget.dataset.value;
			const _Old_DVRadius = Session.get('Old_DVRadius');

			if( (String(_Old_DVRadius) != "undefined") ){
				$('#DVRadius' + _Old_DVRadius).css({
					"background-color":"#f7efea"
				});
				Meteor.call('DobulePush', DobuleVicePullPush.get(), 
					(err,res)=>{
						if(res){
							DobuleVicePullPush.set(0);
						};
				});
			};

			$('#DVRadius' + datasetNumber).css({
				"background-color":"red"
			});

			const _DVid = tmp.$('[name=DVid' + datasetNumber + ']').val();
			const _DVsauceid = tmp.$('[name=DVsauceid' + datasetNumber + ']').val();

			const _DVsauceid_split = _DVsauceid.split(',');

			let DVsaucesplit = [];
			_DVsauceid_split.forEach(function(elem,index){
				DVsaucesplit.push({
					dvobjid: _DVid,
					sauceid: elem
				});
			});
			
			// Pull Dobule Surplus
			if( !(DobuleVicePullPush.get()) ){
				Meteor.call('DobulePull', _DVid, (err,res)=>{
					if(res){
						DobuleVicePullPush.set(_DVid);
					};
				});
			};

			RvDV.set(DVsaucesplit);
			
			Session.set('Old_DVRadius',datasetNumber);
		},
		'click .DFTmp':(evt,tmp)=>{
			evt.preventDefault();
			const datasetNumber = evt.currentTarget.dataset.value;
			const _Old_DFRadius = Session.get('Old_DFRadius');

			if( (String(_Old_DFRadius) != "undefined") ){
				$('#DFRadius' + _Old_DFRadius).css({
					"background-color":"#f7efea"
				});
			};

			$('#DFRadius' + datasetNumber).css({
				"background-color":"red"
			});

			const _DFfoodtitle = Session.get('DFfoodtitle');

			const _Sess_foodtitle  = foodordertitle.get();
			
			const _DFname    = tmp.$('[name=DFname' + datasetNumber + ']').val();
			const _DFMoney   = tmp.$('[name=DFMoney' + datasetNumber + ']').val();
			const _DFsauceid = tmp.$('[name=DFsauceid' + datasetNumber + ']').val();
			
			let DFsaucesplit = [];

			const _DFsauceid_split = _DFsauceid.split(',');

			DFsaucesplit.push({
				objid: _DFfoodtitle,
				title: _Sess_foodtitle,
				sauce: _DFname,
				money: _DFMoney,
				sauceid: _DFsauceid_split.toString()
			});

			// Pull Dobule Surplus
			if( !(DobuleFoodPullPush.get()) ){
				const _SDF = Mongo_ShopDoubleFood.find({
								'_id': _DFfoodtitle
							}).fetch();
				_SDF.forEach((elem, index)=>{
					Meteor.call('DobulePull', elem.Sigleid, (err,res)=>{
						if(res){
							DobuleFoodPullPush.set(elem.Sigleid);
							
						};
					});
				});
			};

			RvDF.set(DFsaucesplit);
			foodordermoney.set(_DFMoney);
			Session.set('Old_DFRadius',datasetNumber);
		},
		'click .TmpFoodSauce':(evt,tmp)=>{
			evt.preventDefault();

			const datasetNumber = evt.currentTarget.dataset.value;
			const _Old_Radius 	= Session.get('Old_Radius');
			
			if( (String(Session.get('Old_Radius')) != "undefined") ){
				$('#FoodSauceRadius' + _Old_Radius).css({
					"background-color":"#f7efea"
				});
			};

			$('#FoodSauceRadius' + datasetNumber).css({
				"background-color":"red"
			});

			const _Sess_food_id = Session.get('SFfoodtitle');

			const _sauceid = $('[name=sauceid' + datasetNumber + ']').val();
			
			const _objid = Session.get('objid');
			
			const _sauceid_split = _sauceid.split(',');

			let saucesplit = [];
			_sauceid_split.forEach(function(elem,index){
				saucesplit.push(elem);
			});

			let SingleFood = [];
			SingleFood.push({
				type: 'single',
				foodid: _Sess_food_id,
				foodname: foodordertitle.get(),
				foodsauceid: saucesplit.toString()
			});

			RvSF.set(SingleFood);

			// Pull Single Surplus
			if( !(SinglePullPush.get()) ){
				Meteor.call('SinglePull', _Sess_food_id, (err,res)=>{
					if(res){
						SinglePullPush.set(_Sess_food_id);
					};
				});
			};

			Session.set('Old_Radius',datasetNumber);
		},
		'click [name=BtnCart]':(evt,tmp)=>{
			evt.preventDefault();
			
			const _RvSF = RvSF.get();
			const _RvDF = RvDF.get();
			const _RvDV = RvDV.get();
			const _RvDD = RvDD.get();
			const _RvST = RvST.get();

			let Cart = [];

			let CARTTmpArray = Session.get('CART');
			
			const backMeun = Session.get('objid');

			if(String(CARTTmpArray) != "undefined"){
				CARTTmpArray.forEach(function(elem,index){
					Cart.push(elem);
				});
			};

			if(OpenSingleList.get()){
				if(_RvSF == 0 ){
					alert("食物資訊未填!!");
				}else{
					navigator.notification.confirm("",
						function (r) {
							switch (r) {
								case 0:
								case 1:
								break;
								case 2:
									Cart.push(_RvSF);
									Session.set('CART',Cart);
									alert("新增一筆餐點");
									RvSF.set(0);
									SinglePullPush.set(0);
									Router.go('post.order', {_id: 1}, {query:('id='+backMeun)});
								break;
							}
						},
						"確定要加入購物車",
						['取消', '確定']
					);
				};
			}else{
				if((_RvDF == 0)){
					alert("主食口味未選！！");
				}else{
					if((_RvDV == 0)){
						alert("副食口味未選！！");
					}else{
						if((_RvDD == 0)){
							alert("飲品未選！！");
						}else{
							if((_RvST == 0)){
								alert("飲品狀態未選！！");
							}else{
								navigator.notification.confirm("",
									function (r) {
										switch (r) {
											case 0:
											case 1:
											break;
											case 2:
												let TmpArray = [];
												
												const _RvDF0 = _RvDF[0];
												const _RvDV0 = _RvDV[0];
												const _RvDD0 = _RvDD[0];
												const _RvST0 = _RvST;

												TmpArray.push({
													type: 'double',
													df: _RvDF0,dv: _RvDV0,
													dd: _RvDD0,st: _RvST0
												});

												Cart.push(TmpArray);
												const backMeun = Session.get('objid');
												Session.set('CART',Cart);
												alert("新增一筆餐點");
												RvDF.set(0);
												RvDV.set(0);
												RvDD.set(0);
												RvST.set(0);
												DobuleFoodPullPush.set(0);
												DobuleVicePullPush.set(0);
												DobuleDrinkPullPush.set(0);
												Router.go('post.order', {_id: 1}, {query:('id='+backMeun)});
											break;
										}
									},
									"確定要加入購物車",
									['取消', '確定']
								);
							};
						};
					};
				};
			};
		},
	});

// 單點食物
	Template.SingleFood.onRendered(function (){
		Meteor.subscribe('ShopSingleMenu');
	});

	Template.SingleFood.helpers({
		SingleFoodList(){
			MeteorEach = [];
			
			const _Mongo_ShopSingleMenu = Mongo_ShopSingleMenu.find({
											'Shop_to_id': ShopObjId.get()
										});
			
			_Mongo_ShopSingleMenu.forEach((elem,index)=>{
				MeteorEach.push({
					id: elem._id,
					name: elem.zh
				});
			});

			return MeteorEach;
		},
	});

// 訂單詳細記錄
	var RDetailTitle = new ReactiveVar('');
	var RDetailMoney = new ReactiveVar(0);

	Template.RecordDetail.onRendered(function () {
		H_window = $(window).height();
		$("#RecordDetailBody").css({'max-height': (H_window - 160) }).scrollTop(0);
	});

	Template.RecordDetail.helpers({
		RecordDetailList(){
			const RDetailInfo = this;
		
			MeteorEach = [];
			
			let CartCount = 0;
			
			Bought.set(0);

			const UO = Mongo_UserOrder.find({'_id': RDetailInfo.id}).fetch();

			UO.forEach((UOelem, UOindex)=>{
				const _UOelemFL = UOelem.foodlist;
				_UOelemFL.reverse();
				_UOelemFL.forEach((_UOelemFLelem, _UOelemFLindex)=>{
					const _type = _UOelemFLelem.type;
					CartCount++;

					if(_type == "single"){
						const SSF = Mongo_ShopSingleFood.find({
								'_id': _UOelemFLelem.foodid
							}).fetch();

						SSF.forEach(function(SSFelem,SSFindex){
							const SSM = Mongo_ShopSingleMenu.find({
											'_id': SSFelem.SingleMenu_id
										}).fetch();

							SSM.forEach(function(SSMelem,SSMindex){
								const _elem0_FSid = _UOelemFLelem.foodsauceid.split(',');
								let _sauce = "";
								_elem0_FSid.forEach(function(FSidelem,FSidindex){
									const FS = Mongo_FoodSauce.find({
													'_id': FSidelem
												}).fetch();

									FS.forEach(function(FSelem,FSindex){
										_sauce += FSelem.zh;
										if(FSidindex < (_elem0_FSid.length - 1)){
											_sauce += ',';
										};
									});

								});

								MeteorEach.push({
									SingleOrDouble: 1,
									head: CartCount+'.'+_SingleOrDouble[1],
									catena: SSMelem.zh + "系列",
									name: _UOelemFLelem.foodname,
									sauce: _sauce,
									money: "NT$ " + SSFelem.money
								});

							});
						});
					}else{

						const _elem0_df = _UOelemFLelem.df; // 主餐
						const _elem0_dv = _UOelemFLelem.dv; // 副餐
						const _elem0_dd = _UOelemFLelem.dd; // 飲品 濃湯
						const _elem0_st = _UOelemFLelem.st; // 原味 糖 冰塊

						// 主食 主食甜品 價錢 
						const First_SDF = Mongo_ShopDoubleFood.find({
												'_id': _elem0_df.objid
											}).fetch();
												
						First_SDF.forEach(function(FSDFelem,FSDFindex){
							const First_SSF = Mongo_ShopSingleFood.find({
												'_id': FSDFelem.Sigleid
											}).fetch();

							First_SSF.forEach(function(FSSFelem,FSSFindex){
								const First_SSM = Mongo_ShopSingleMenu.find({
											'_id': FSSFelem.SingleMenu_id
										}).fetch();

								First_SSM.forEach(function(FSSMelem,FSSMindex){
									// 副餐
									const Second_SSF = Mongo_ShopSingleFood.find({
														'_id': _elem0_dv.dvobjid
													}).fetch();

									Second_SSF.forEach(function(SSSFelem,SSSFindex){
										const Second_FS = Mongo_FoodSauce.find({
														'_id': _elem0_dv.sauceid
													}).fetch();

										Second_FS.forEach(function(SFSelem,SFSindex){
											// 飲品
											const dirnkName = Mongo_ShopSingleFood.find({
																'_id': _elem0_dd.singlefoodid
															}).fetch();

											dirnkName.forEach(function(DNelem,DNindex){
												let TmpSauce = " (";
												
												_elem0_st.forEach(function(STelem,STindex){
													const drink_sauce = Mongo_FoodSauce.find({
																			'_id': STelem.sauceid
																		}).fetch();

													drink_sauce.forEach(function(Dselem,Dsindex){
														TmpSauce += Dselem.zh;
														if(STindex < (_elem0_st.length - 1)){
															TmpSauce += ',';
														};
													});
												});

												TmpSauce += ')';

												MeteorEach.push({
													SingleOrDouble: 0, // 1=單點 ,0=套餐
													head: CartCount+'.'+_SingleOrDouble[0],
													meal: _elem0_df.title,
													first: FSSFelem.zh + '('+ _elem0_df.sauce +')',
													second: SSSFelem.zh + '('+ SFSelem.zh +')',
													drink: DNelem.zh + TmpSauce,
													money: "NT$ " + _elem0_df.money
												});
												
											});
										});
									});
								});
							});
						});

					};
				});

				RDetailMoney.set(UOelem.money);
			});

			RDetailTitle.set(RecordTitle[parseInt(RDetailInfo.type)]);
			return MeteorEach;
		},
		CartSingleOrDouble(open){
			return open;
		},
		title(){
			return RDetailTitle.get();
		},
		RDmoney(){
			return RDetailMoney.get();
		},
	});

// 訂單記錄
	const RecordTitle = ["尚未受理","完成訂單","進行中","取消訂單","待取餐","歷史訂單"];
	
	var OpenRecord = new ReactiveVar(0);
	var Recordinfo = new ReactiveVar(0);
	var Bought = new ReactiveVar(0);
	var myselfRecord = new ReactiveVar(0);
	
	// 解析記錄時間
	function ResolveTime(_time){
		let TmpArray = [];
		const dt = new Date( (_time * 1000) );
		TmpArray[0] = dt.getFullYear();
		TmpArray[1] = (dt.getMonth() + 1);
		TmpArray[2] = dt.getDate();
		TmpArray[3] = dt.getHours();
		TmpArray[4] = "0" + dt.getMinutes();
		return TmpArray;
	};

	// 現在時間
	function NowTime(){
		let TmpArray = [];
		const NowDT = new Date();
		TmpArray[0] = NowDT.getFullYear();
		TmpArray[1] = (NowDT.getMonth() + 1);
		TmpArray[2] = NowDT.getDate();
		return TmpArray;
	};

	Template.Record.helpers({
		RecordList(){
			MeteorEach = [];
			
			let _Recordinfo = this.type;
			// let _Recordinfo = 0;

			OpenRecord.set(0);
			if(String(_Recordinfo) != "undefined"){
				OpenRecord.set(1);
				Bought.set(1);
			};

			RecordTitle.forEach((RTelem, RTindex)=>{
				MeteorEach.push({
					index: RTindex,
					title: RTelem
				});
			});

			return MeteorEach;
		},
		IFRecordList(){
			MeteorEach = [];
			// 0 尚未受理
			// 1 完成訂單
			// 2 進行中
			// 3 取消訂單
			// 4 待取餐
			// 5 歷史訂單
			const _buyfinishRecord = this.type; // just ( undefined or 0 )
			
			const _userId = Meteor.userId();

			let Both_Record_Number = myselfRecord.get();

			if(String(_buyfinishRecord) != "undefined"){
				Both_Record_Number = _buyfinishRecord;
			};

			const _UIF = Mongo_UserInfo.find({'users_to_id': _userId}).fetch();

			_UIF.forEach((UIFelem, UIFindex)=>{
				const _UIF_order = UIFelem.order;
				
				_UIF_order.reverse();
				_UIF_order.forEach((_UIF_orderelem, _UIF_orderindex)=>{
					// 解析紀錄時間
					const ordetime = ResolveTime(_UIF_orderelem.timestamp);
					// 現在時間
					const TimeArray = NowTime();

					// 當天時間 相同 訂購時間
					if(	(TimeArray[0] == ordetime[0]) && 
						(TimeArray[1] == ordetime[1]) && 
						(TimeArray[2] == ordetime[2]) ){

						if( (_UIF_orderelem.type == Both_Record_Number) ){
							const _Shop = Mongo_Shop.find({
											'_id': _UIF_orderelem.shopid
										}).fetch();
							_Shop.forEach((_Shopelem, _Shopindex)=>{
								// 等於歷史
								MeteorEach.push({
									objid: (_UIF_orderelem.user_order_id),
									type: Both_Record_Number,
									name: (_Shopelem.shopname),
									date: ( ordetime[0] + '-' + ordetime[1] + '-' + ordetime[2] + ' ' + ordetime[3] + ':' + ordetime[4].substr(-2))
								});	
							});
						};
						// 當天時間 小於 訂購時間
					}else if( (TimeArray[0] >= ordetime[0]) && 
							  (TimeArray[1] >= ordetime[1]) && 
							  (TimeArray[2] >= ordetime[2]) ){

						if( (5 == Both_Record_Number) ){
							const _Shop = Mongo_Shop.find({
											'_id': _UIF_orderelem.shopid
										}).fetch();
							_Shop.forEach((_Shopelem, _Shopindex)=>{
								// 等於歷史
								MeteorEach.push({
									objid: (_UIF_orderelem.user_order_id),
									type: Both_Record_Number,
									name: (_Shopelem.shopname),
									date: ( ordetime[0] + '-' + ordetime[1] + '-' + ordetime[2] + ' ' + ordetime[3] + ':' + ordetime[4].substr(-2))
								});	
							});
						};
					};
				});
			});

			return MeteorEach;
		},
		Bought(){
			return Bought.get();
		},
		IFRecordType(){
			return OpenRecord.get();
		},
	});

	Template.Record.events({
		'click .btnrecord':(evt,tmp)=>{
			evt.preventDefault();
			
			const datasetNumber = evt.currentTarget.dataset.value;
			const _Old_BRdiv = Session.get('Old_BRdiv');

			Bought.set(0);

			if( (String(_Old_BRdiv) != "undefined") ){
				$('[name=BtnRecord' + _Old_BRdiv + ']').css({
					"background-color": "#f7efea"
				});
			};

			$('[name=BtnRecord' + datasetNumber + ']').css({
				"background-color": "#FFCCCC"
			});

			myselfRecord.set(parseInt(datasetNumber));

			OpenRecord.set(1);
			Session.set('Old_BRdiv',datasetNumber);
			Router.go('post.Record');
		},
	});

// FB
	Template.vfooter.onRendered(function(){
		Meteor.subscribe('UserInfo');
	});

	Accounts.onLogin(function () {
		// Meteor.logoutOtherClients(function (error) {
			// Meteor.call('UpToken', Objid);
			// Meteor.logout();
			// Router.go('post.login');
		// });

		const Login = Meteor.user().profile;
		const Objid = Meteor.userId();

		if(!(_.isUndefined(Login))){
			if(Login.facebook){
				window.plugins.spinnerDialog.show("", "加載中...",true);
				_.delay(function(){
					const UIF = Mongo_UserInfo.find({'users_to_id': Objid}).fetch();
					if( (UIF == "") ){
						RegisterStep.set('FB');
						Router.go('post.RegisterOfPhone');
					}else{
						FCMPlugin.getToken(function (GetToken){
							const _id = Meteor.userId();
							const _platform = device.platform;
							const _token = GetToken;
							const _uuid  = device.uuid;
							Meteor.call('UpdateInfo', _id, _token, _uuid, _platform,
								(err,res) => {
								if(res){
									window.plugins.spinnerDialog.show("", "加載中...",true);
									Router.go('post.MainTmp');
								};
							});
						});
					};
				},5000);

			};
		};
	});

	Template.vfooter.events({
		'click [name=FbBtn]':(evt,tmp)=>{
			evt.preventDefault();
			Meteor.loginWithFacebook({
			    requestPermissions:['public_profile','email']
		    });
		},
	});

// Add Push Surplus
	Template.shopplugin.events({
		'click [name=PushSurplus]':(evt,tmp)=>{
			evt.preventDefault();
			Meteor.call('InsertSurplus');
			console.log('+1');
		},
	});

// 登入
	Template.login.events({
		'submit form':(evt,tmp)=>{
			evt.preventDefault();
			const target 	 = evt.target;
		    const vUserEmail = target.userphone.value + '@jnad1798.com';
		    const vUserPwd 	 = target.userpwd.value;
			Meteor.loginWithPassword(vUserEmail, vUserPwd, function (err) {
				if(err){
					target.userphone.value = '';
					target.userpwd.value   = '';
					alert("帳號或是密碼有誤");
				}else{
					FCMPlugin.getToken(function (GetToken){
						const _id = Meteor.userId();
						const _platform = device.platform;
						const _token = GetToken;
						const _uuid  = device.uuid;
						Meteor.call('UpdateInfo', _id, _token, _uuid, _platform,
							(err,res) => {
							if(res){
								window.plugins.spinnerDialog.show("", "加載中...",true);
								target.userphone.value = '';
								target.userpwd.value   = '';
								Router.go('post.MainTmp');
							};
						});
					});
				};
			});
		},
		'click #btn_register':(evt,tmp)=>{
			evt.preventDefault();
			RegisterStep.set('NoFB');
			Router.go('post.RegisterOfPhone');
		},
		'change [name=userphone]': (evt, tmp) => {
	        evt.preventDefault();
	        const _userphone = evt.target.value;
	        if(_userphone.length < 10) {
	            alert('密碼不能小於10位');
	            evt.target.value = '';
	        };
	    },
	    'change [name=userpwd]': (evt, tmp) => {
	        evt.preventDefault();
	        const _userpwd = evt.target.value;
	        if(_userpwd.length < 8) {
	            alert('密碼不能小於8位');
	            evt.target.value = '';
	        };
	    }
	});
