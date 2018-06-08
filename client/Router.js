import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import './Helpers.js';

	SpinnerDialogController = RouteController.extend({
	  	onAfterAction: function () {
		  	window.plugins.spinnerDialog.hide();
			this.next();
		},
	});

	Router.configure({
	  controller: 'SpinnerDialogController'
	});

// 註冊之一
	Router.route('/RegisterOfPhone', {
		name: 'post.RegisterOfPhone',
		layoutTemplate: 'MainTmp',
		data: {
			title: '註冊第一步',
			check: 'ROP',
		},
		yieldRegions: {
			'RegisterOfPhone': {to: 'plugin'},
		},
	});

// 註冊之二
	Router.route('/RegisterOfAccount', {
		name: 'post.RegisterOfAccount',
		layoutTemplate: 'MainTmp',
		data: {
			title: '註冊第二步',
			check: 'ROA',
		},
		yieldRegions: {
			'RegisterOfAccount': {to: 'plugin'},
		},
	});

//	會員條款
	Router.route('/Rule', {
		name: 'post.Rule',
		layoutTemplate: 'MainTmp',
		data: {
			title: '會員條款',
		},
		yieldRegions: {
		  'Rule': {to: 'plugin'},
		},
	});

//	意見反饋
	Router.route('/Comment', {
		name: 'post.Comment',
		layoutTemplate: 'MainTmp',
		data: {
			title: '意見反饋',
		},
		yieldRegions: {
		  'Comment': {to: 'plugin'},
		},
	});

// 更換手機
	Router.route('/MemberOfchangePhone', {
		name: 'post.MemberOfchangePhone',
		layoutTemplate: 'MainTmp',
		data: {
			title: '更換手機',
		},
		yieldRegions: {
		  	'MemberOfchangePhone': {to: 'plugin'},
		},
	});

// 信箱驗證
	Router.route('/MemberOfMail', {
		name: 'post.MemberOfMail',
		layoutTemplate: 'MainTmp',
		data: function() {
			const RouteData = {
				title: '信箱驗證',
				_id: this.params.query.id,
				index: parseInt(this.params.query.path),
			};
			
			Meteor.subscribe('UserInfo');
			Meteor.subscribe('Downtown');

			return RouteData;
		},
		yieldRegions: {
		  	'MemberOfMail': {to: 'plugin'},
		},
	});
 
//	即時訊息詳細
	Router.route('/NotifiDetail', {
		name: 'post.NotifiDetail',
		layoutTemplate: 'MainTmp',
		data: function() {
			const RouteData = {
				title: '通知詳細',
				_id: this.params.query.id,
				index: parseInt(this.params.query.path),
			};

			Meteor.subscribe('UserNotifi');

			return RouteData;
		},
		yieldRegions: {
		  	'NotifiDetail': {to: 'plugin'},
		},
	});

//	即時訊息
	Router.route('/Notifi', {
		name: 'post.Notifi',
		layoutTemplate: 'MainTmp',
		data:()=>{
			const obj = {
				title: '通知訊息',
			};
			 
			Meteor.subscribe('UserInfo');
			Meteor.subscribe('UserNotifi');

			return obj;
		},
		yieldRegions: {
		  	    'Notifi': {to: 'plugin'},
		 'accountplugin': {to: 'ftplugin'}
		},
	});

// 排隊列表
	Router.route('/lineup', {
		name: 'post.lineup',
		layoutTemplate: 'MainTmp',
		data: {
			title: '排列訂單',
		},
		yieldRegions: {
			'lineup': {to: 'plugin'},
			'accountplugin': {to: 'ftplugin'}
		},
	});

// 詳細點餐
	Router.route('/foodorder', {
		name: 'post.foodorder',
		layoutTemplate: 'MainTmp',
		data: function () {

			const obj = {
				title: '點餐資訊',
				path: Session.get('objid'),
				objid: this.params.query.id
			};

			Meteor.subscribe('ShopDoubleFood');
			Meteor.subscribe('ShopSingleFood');
			Meteor.subscribe('FoodSauce');
			
			return obj;
		},
		yieldRegions: {
			'foodorder': {to: 'plugin'},
		},
	});

//	消費記錄詳細
	Router.route('/RecordDetail', {
		name: 'post.RecordDetail',
		layoutTemplate: 'MainTmp',
		data: function () {

			const obj = {
				title: '訂單詳細記錄',
				id: this.params.query.id,
				type: this.params.query.type
			};

			Meteor.subscribe('UserOrder');
			Meteor.subscribe('FoodSauce');
			Meteor.subscribe('ShopSingleFood');
			Meteor.subscribe('ShopSingleMenu');
			Meteor.subscribe('ShopDoubleFood');

			return obj;
		},
		yieldRegions: {
		  	'RecordDetail': {to: 'plugin'},
		},
	});

//	消費記錄
	Router.route('/Record', {
		name: 'post.Record',
		layoutTemplate: 'MainTmp',
		data: function () {

			const obj = {
				title: '訂單記錄',
				type: this.params.query.type
			};

			Meteor.subscribe('UserInfo');
			Meteor.subscribe('Shop');

			return obj;
		},
		yieldRegions: {
		  	'Record': {to: 'plugin'},
		  	'accountplugin': {to: 'ftplugin'}
		},
	});

// 菜單
	Router.route('/order', {
		name: 'post.order',
		layoutTemplate: 'MainTmp',
		data: function () {

			const obj = {
				title: '菜單',
				objid: this.params.query.id
			};
			Meteor.subscribe('FoodSauce');
			Meteor.subscribe('ShopSingleFood');
			Meteor.subscribe('ShopSingleMenu');
			Meteor.subscribe('ShopDoubleFood');
			Meteor.subscribe('UserInfo');
			return obj;
		},
		yieldRegions: {
			'order': {to: 'plugin'},
			'accountplugin': {to: 'ftplugin'}
		},
	});

// 根路徑
	Router.route('/', {
		name: 'post.MainTmp',
		layoutTemplate: 'MainTmp',
		data: {
			title: '商家資訊',
			check: 'HOME',
		},
		yieldRegions: {
			'shopplugin': {to: 'plugin'},
			'accountplugin': {to: 'ftplugin'}
		},
	});

//	會員專區
	Router.route('/Member', {
		name: 'post.Member',
		layoutTemplate: 'MainTmp',
		data:()=>{
			const obj = {
				title: '會員專區',
			};
			 
			Meteor.subscribe('UserInfo');
			Meteor.subscribe('Downtown');

			return obj;
		},
		yieldRegions: {
		  	'Member': {to: 'plugin'},
		  	'accountplugin': {to: 'ftplugin'}
		},
	});

// 重置密碼
	Router.route('/FormatPwd', {
		name: 'post.FormatPwd',
		layoutTemplate: 'MainTmp',
		data: {
			title: '重置密碼',
			check: 'REFORGET',
		},
		yieldRegions: {
			'FormatPwd': {to: 'plugin'},
		},
	});

// 忘記密碼
	Router.route('/Forget', {
		name: 'post.Forget',
		layoutTemplate: 'MainTmp',
		data: {
			title: '忘記密碼',
			check: 'FORGET',
		},
		yieldRegions: {
			'Forget': {to: 'plugin'},
		},
	});

// 登入
	Router.route('/login', {
		name: 'post.login',
		layoutTemplate: 'MainTmp',
		data: {
			title: '1798',
			check: 'LOGIN',
		},
		yieldRegions: {
		 // 'vfooter': {to: 'pluginfooter'}
		},
	});

