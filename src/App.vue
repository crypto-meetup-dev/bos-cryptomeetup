<template>
  <div id="app">
    <!--<GlobalProgress v-show="globalProgressVisible" :progress="globalProgressValue" />-->
    <Loading v-show="globalProgressVisible" loadText="loading ..." />
    <!--<GlobalSpinner v-show="!globalProgressVisible && globalSpinnerVisible" />-->
    <Loading v-show="!globalProgressVisible && globalSpinnerVisible" loadText="loading ..." />
    <!--<div class="app-nav is-hidden-mobile" v-show="!tokenShow">-->
    <div class="mylangd" v-if="isShowMylangd">
      <div class="close-mylangd" @click="closeMylangd"><img src="./assets/icons/close.png" /></div>
      <div 
        v-if="myLangdArr.length" 
        v-for="(item, index) in myLangdArr" 
        :key="index" 
        class="mylangd-item"
      >
        <p>{{$t('my_portal_name')}}: {{getCountryName(item.name.code)}}</p>
        <p>{{$t('my_portal_price')}}: {{`${item.price / 10000} BOS`}}</p>
      </div>
      <div v-if="!myLangdArr.length" class="no-langd">
        No
      </div>
    </div>
    <div class="app-nav is-hidden-mobile">
      <button :class="['nav-item', 'button', 'is-white', 'is-small', 'is-rounded', 'is-outlined', { 'is-loading': isScatterLoggingIn }]"
        @click="loginScatterAsync"
        v-if="!scatterAccount && appLogin"
      >
        <b-icon icon="account" size="is-small" />&nbsp;{{$t('login')}}
      </button>
      <button :class="['nav-item', 'button', 'is-white', 'is-small', 'is-rounded', 'is-outlined']"
        @click="logoutScatterAsync"
        v-if="isScatterConnected && scatterAccount"
      >
        <b-icon icon="account" size="is-small" />&nbsp;{{$t('logout')}} {{scatterAccount.name}}
      </button>
      <button :class="['nav-item', 'button', 'is-white', 'is-small', 'is-rounded', 'is-outlined']"
         @click="changeInviteStatus"
         v-if="scatterAccount"
      >
        <b-icon icon="account" size="is-small" />&nbsp;{{$t('invite')}}
      </button>
      <b-modal :active.sync="isInviteDialogActive" has-modal-card>
        <invite-modal></invite-modal>
      </b-modal>
      <a class="nav-item" @click="aboutShow=!aboutShow">{{$t('about_view')}}</a>
      <a class="nav-item" @click="taggleMyPortal">{{$t('my_portal_nav')}}</a>
      <a class="nav-item" @click="tokenShow=!tokenShow">{{$t('token_view')}}</a>
    </div>
    <Tokenview
      :tokenShow="tokenShow"
      :mobileTokenShow="mobileTokenShow"
      :globalInfo="globalInfo"
      :dividendInfo="dividendInfo"
      :scatterAccount="scatterAccount"
      :balances="balances"
      :marketInfo="marketInfo"
      :stakedInfo="stakedInfo"
      @CloseTokenView="CloseTokenView"
      @CloseMobileTokenView="CloseMobileTokenView"
      @claim="claim"
      @stake="stake"
      @unstake="unstake"
      @refund="refund"
      @loginScatterAsync="loginScatterAsync"
      @buyCMU="buyCMU"
      @sellCMU="sellCMU"
      @vote="vote"
    />
    <Aboutview
      :aboutShow="aboutShow"
      :mobileAboutShow="mobileAboutShow"
      @CloseAboutView="CloseAboutView"
      @CloseMobileAboutView="CloseMobileAboutView"
    />
    <div class="app-footer">
      <div class="footer-item is-hidden-mobile"><a target="_blank" href="https://twitter.com/Cryptomeetupio"><b-icon icon="twitter" size="is-small" /></a></div>
      <div class="footer-item is-hidden-mobile"><a target="_blank" href="https://t.me/Cryptomeetup_Official"><b-icon icon="telegram" size="is-small" /></a></div>
      <div class="footer-item is-hidden-mobile"><a target="_blank" href="https://discordapp.com/invite/Ws3ENJf"><b-icon icon="discord" size="is-small" /></a></div>
      <div class="footer-item is-hidden-mobile"><a target="_blank" href="https://medium.com/@cryptomeetup"><b-icon icon="medium" size="is-small" /></a></div>
      <div class="footer-item is-hidden-mobile"><a target="_blank" href="https://www.reddit.com/user/cryptomeetup"><b-icon icon="reddit" size="is-small" /></a></div>
      <div class="footer-item is-hidden-mobile"><a target="_blank" href="https://github.com/crypto-meetup-dev"><b-icon icon="github-circle" size="is-small" /></a></div>
      <div class="footer-item is-hidden-mobile">{{$t('cmu_creator')}}</div>
      <div class="footer-item is-hidden-mobile">{{$t('powered_by')}} <a target="_blank" href="https://bos.eosx.io/">BOS</a></div>
      <div class="footer-item" v-if="globalInfo && latestBuyerVisible">{{$t('last_buyer')}}: <b>{{ globalInfo.last }}</b> </div>
      <div class="footer-item" v-if="globalInfo && latestBuyerVisible">{{$t('count_down')}}: <b>{{ globalCountdown }}</b> </div>
      <div class="footer-item" v-if="globalInfo && latestBuyerVisible">
        {{$t('prize_pool')}}: <b>{{ globalInfo.pool | price('CMU') }}</b>
        <b-tooltip
          :label="$t('app_FTextBubble')"
          position="is-top">
          <a href="https://kyubey.network/Token/CMU/exchange" target="_blank"><b-icon class="question-icon" pack="fas" type="is-white" icon="question-circle" size="is-middle" /></a>
        </b-tooltip>
      </div>
      <div class="footer-item is-hidden-mobile">
        <b-select class="is-inverted" v-model="i18nCode" :placeholder="$t('switch_lang')" size="is-small" rounded>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
          <option value="ru">русский</option>
          <option value="zh">简体中文</option>
          <option value="zh_tw">繁體中文</option>
        </b-select>
      </div>
    </div>
    <a
      :class="['app-nav-burger', 'is-hidden-tablet', { 'is-active': mobileNavExpanded }]"
      v-show="navBurgerVisible"
    >
      <a @click="mobileNavExpanded = !mobileNavExpanded">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
      <button :class="['app-map-login', 'nav-item', 'button', 'is-white', 'is-small', 'is-rounded', 'is-outlined', { 'is-loading': isScatterLoggingIn }]"
        @click="loginScatterAsync"
        v-if="!scatterAccount && appLogin"
      >
        {{$t('login')}}
      </button>
    </a>
    <slide-y-up-transition>
      <div>
        <div class="app-nav-expand is-hidden-tablet app-app-nav-expand" v-show="navBurgerVisible && mobileNavExpanded" @click="mobileNavExpanded=false"><!-- Nav Items on mobile -->

          <a class="app-nav-expand-item" @click="taggleMyPortal">{{$t('my_portal_nav')}}</a>
          <a class="app-nav-expand-item" v-if="scatterAccount" @click="changeInviteStatus"><b-icon icon="bank" size="is-small" />{{' '+$t('invite')}}</a>
          <a class="app-nav-expand-item" @click="mobileAboutShow=!mobileAboutShow;"><b-icon class="question-icon" pack="fas" icon="question-circle" size="is-small"></b-icon>
  {{' '+$t('about_view')}}</a>
          <a class="app-nav-expand-item" @click="mobileTokenShow=!mobileTokenShow;"><b-icon icon="bank" size="is-small" />{{' '+$t('token_view')}}</a>
          <a class="app-nav-expand-item" target="_blank" href="https://twitter.com/Cryptomeetupio"><b-icon icon="twitter" size="is-small" /> Twitter</a>
          <a class="app-nav-expand-item" target="_blank" href="https://t.me/Cryptomeetup_Official"><b-icon icon="telegram" size="is-small" /> Telegram</a>
          <a class="app-nav-expand-item" target="_blank" href="https://discordapp.com/invite/Ws3ENJf"><b-icon icon="discord" size="is-small" /> Discord</a>
          <a class="app-nav-expand-item" target="_blank" href="https://medium.com/@cryptomeetup"><b-icon icon="medium" size="is-small" /> Medium</a>
          <a class="app-nav-expand-item" target="_blank" href="https://www.reddit.com/user/cryptomeetup"><b-icon icon="reddit" size="is-small" /> Reddit</a>
          <a class="app-nav-expand-item" target="_blank" href="https://github.com/crypto-meetup-dev"><b-icon icon="github-circle" size="is-small" /> GitHub</a>
          <div class="app-nav-expand-item" @click.stop>
            <b-select class="is-inverted" v-model="i18nCode" icon="translate" :placeholder="$t('switch_lang')" size="is-small" rounded expanded>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="ru">русский</option>
              <option value="zh">简体中文</option>
              <option value="zh_tw">繁體中文</option>
            </b-select>
          </div>
        </div>
        <b-modal :active.sync="isInviteDialogActive" has-modal-card>
          <invite-modal></invite-modal>
        </b-modal>
      </div>
    </slide-y-up-transition>
    <keep-alive include="map-view,globe-view"><router-view/></keep-alive>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Global from './Global.js';
import Aboutview from '@/views/About.vue';
import Tokenview from '@/views/Token.vue';
import API, { eos } from '@/util/api';
// import GlobalSpinner from '@/components/GlobalSpinner.vue';
import Loading from '@/components/Loading.vue';
// import GlobalProgress from '@/components/GlobalProgress.vue';
import InviteModal from '@/components/InviteModal.vue';
import myPortal from '@/components/landmark//myPortal.vue'
import * as CountryCode from 'i18n-iso-countries';

CountryCode.registerLocale(require('i18n-iso-countries/langs/en.json'));
CountryCode.registerLocale(require('i18n-iso-countries/langs/zh.json'));
CountryCode.registerLocale(require('i18n-iso-countries/langs/ko.json'));
CountryCode.registerLocale(require('i18n-iso-countries/langs/ja.json'));
CountryCode.registerLocale(require('i18n-iso-countries/langs/ru.json'));
// 繁体中文
CountryCode.registerLocale(require('./i18n/Country_zh_tw.json'));

export default {
  name: 'App',
  components: {
    Loading,
    //  GlobalSpinner,
    //  GlobalProgress,
    Aboutview,
    Tokenview,
    InviteModal,
    myPortal
  },
  data: () => ({
    mobileNavExpanded: false,
    tokenShow: false,
    aboutShow: false,
    globalCountdown: '00:00:00',
    mobileTokenShow: false,
    mobileAboutShow: false,
    isRedeeming: false,
    isInviteDialogActive : false,
    appLogin: false,
    portalShow: false,
    portalList: [],
    i18nCode: '',
    isShowMylangd: false,
    myLangdArr: []
  }),
  created() {
    this.countdownUpdater = setInterval(() => {
      if (this.globalInfo != null) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (currentTimestamp >= this.globalInfo.ed) {
          this.globalCountdown = 'ENDED';
        } else {
          let remaining = this.globalInfo.ed - currentTimestamp;
          const seconds = `${remaining % 60}`;
          remaining = Math.floor(remaining / 60);
          const minutes = `${remaining % 60}`;
          remaining = Math.floor(remaining / 60);
          const hours = `${remaining}`;
          this.globalCountdown = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        }
      }
    }, 1000);

    Global.$on('onLoadMap', () => {
      this.appLogin = true
    })

    Global.$on('portalList', portalList => {
      this.portalList = portalList
    })

    this.getLangCode()
  },
  methods: {
    ...mapActions(['getMyStakedInfo', 'getMyBalances', 'connectScatterAsync', 'updateLandInfoAsync', 'loginScatterAsync', 'logoutScatterAsync', 'updateMarketInfoAsync', 'getGlobalInfo']),
    closeMylangd () {
      this.isShowMylangd = false
    },
    getCountryName(countryCode) {
      const locale = CountryCode.langs().includes(this.$i18n.locale) ? this.$i18n.locale : 'en';
      return CountryCode.getName(countryCode, locale);
    },
    async vote (voteName, callback) {
      try {
        await API.voteAsync({to: voteName})
        this.$toast.open({
          message: '投票成功',
          type: 'is-success',
          duration: 3000,
          queue: false,
        })
        this.getMyStakedInfo()
        callback && callback()
      } catch (error) {
        console.error(error);
        let msg;
        if (error.message === undefined) {
          msg = JSON.parse(error).error.details[0].message;
        } else {
          msg = error.message;
        }
        this.$toast.open({
          message: `Stake failed: ${msg}`,
          type: 'is-danger',
          duration: 3000,
          queue: false,
          position: 'is-bottom',
        });
      }
    },
    async stake() {
      let amount = window.prompt(this.$t('stake_number_alert'));
      amount = parseFloat(amount).toFixed(4);
      amount += ' CMU';
      try {
        await API.stakeCMUAsync({
          from: this.scatterAccount.name,
          to: 'cryptomeetup',
          memo: 'stake',
          amount,
        });
        this.getMyStakedInfo()
        this.getGlobalInfo()
        this.getMyBalances()
        this.$dialog.alert({
          type: 'is-black',
          title: this.$t('stake_successful_alert'),
          message: this.$t('stake_pay_attention_alert'),
          confirmText: this.$t('ok'),
        });
      } catch (error) {
        console.error(error);
        let msg;
        if (error.message === undefined) {
          msg = JSON.parse(error).error.details[0].message;
        } else {
          msg = error.message;
        }
        this.$toast.open({
          message: `Stake failed: ${msg}`,
          type: 'is-danger',
          duration: 3000,
          queue: false,
          position: 'is-bottom',
        });
      }
    },
    async unstake() {
      try {
        const contract = await eos().contract('cryptomeetup');
        const amount = parseFloat(window.prompt(this.$t('unstake_alert'))).toFixed(4) + ' CMU';
        await contract.unstake(
          this.scatterAccount.name,
          amount,
          {
            authorization: [`${this.scatterAccount.name}@${this.scatterAccount.authority}`],
          },
        );
        this.getMyStakedInfo()
        this.getGlobalInfo()
        this.getMyBalances()
        this.$dialog.alert({
          type: 'is-black',
          title: this.$t('unstake_success'),
          message: this.$t('wait_alert'),
          confirmText: this.$t('ok'),
        });
      } catch (error) {
        console.error(error);
        let msg;
        if (error.message === undefined) {
          msg = JSON.parse(error).error.details[0].message;
        } else {
          msg = error.message;
        }
        this.$toast.open({
          message: `Unstake failed: ${msg}`,
          type: 'is-danger',
          duration: 3000,
          queue: false,
        });
      }
    },
    async refund() {
      try {
        const contract = await eos().contract('cryptomeetup');
        await contract.refund(
          this.scatterAccount.name,
          {
            authorization: [`${this.scatterAccount.name}@${this.scatterAccount.authority}`],
          },
        );
        this.getMyStakedInfo()
        this.getGlobalInfo()
        this.getMyBalances()
        this.$dialog.alert({
          type: 'is-black',
          message: 'Refund Success',
          confirmText: this.$t('ok'),
        });
      } catch (error) {
        console.error(error);
        let msg;
        if (error.message === undefined) {
          msg = JSON.parse(error).error.details[0].message;
        } else {
          msg = error.message;
        }
        this.$toast.open({
          message: `Unstake failed: ${msg}`,
          type: 'is-danger',
          duration: 3000,
          queue: false,
        });
      }
    },
    async claim() {
      try {
        const contract = await eos().contract('cryptomeetup');
        await contract.claim(
          this.scatterAccount.name,
          {
            authorization: [`${this.scatterAccount.name}@${this.scatterAccount.authority}`],
          },
        );
        this.$dialog.alert({
          type: 'is-black',
          title: this.$t('claim_success'),
          message: this.$t('wait_alert'),
          confirmText: this.$t('ok'),
        });
      } catch (error) {
        console.error(error);
        let msg;
        if (error.message === undefined) {
          msg = JSON.parse(error).error.details[0].message;
        } else {
          msg = error.message;
        }
        this.$toast.open({
          message: `Claim failed: ${msg}`,
          type: 'is-danger',
          duration: 3000,
          queue: false,
        });
      }
    },
    async buyCMU() {
      let amount = window.prompt(this.$t('buy_cmu_alert'));
      amount = parseFloat(amount).toFixed(4);
      amount += ' BOS';
      try {
        await API.transferTokenAsync({
          from: this.scatterAccount.name,
          to: 'cryptomeetup',
          memo: 'buy',
          amount,
        });
        this.getMyStakedInfo()
        this.getMyBalances()
        this.$dialog.alert({
          type: 'is-black',
          title: this.$t('buy_cmu_success_alert'),
          message: this.$t('after_buy_cmu_alert'),
          confirmText: this.$t('ok'),
        });
      } catch (error) {
        console.error(error);
        let msg;
        if (error.message === undefined) {
          msg = JSON.parse(error).error.details[0].message;
        } else {
          msg = error.message;
        }
        this.$toast.open({
          message: `Buy CMU failed: ${msg}`,
          type: 'is-danger',
          duration: 3000,
          queue: false,
        });
      }
    },
    async sellCMU() {
      let amount = window.prompt(this.$t('sell_cmu_alert'));
      amount = parseFloat(amount).toFixed(4);
      amount += ' CMU';
      try {
        await API.transferTokenAsync({
          from: this.scatterAccount.name,
          to: 'cryptomeetup',
          tokenContract: 'ncldwqxpkgav',
          memo: 'sell',
          amount,
        });
        this.getMyStakedInfo()
        this.getMyBalances()
        this.$dialog.alert({
          type: 'is-black',
          title: this.$t('sell_cmu_success_alert'),
          message: this.$t('after_sell_cmu_alert'),
          confirmText: this.$t('ok'),
        });
      } catch (error) {
        console.error(error);
        let msg;
        if (error.message === undefined) {
          msg = JSON.parse(error).error.details[0].message;
        } else {
          msg = error.message;
        }
        this.$toast.open({
          message: `Stake failed: ${msg}`,
          type: 'is-danger',
          duration: 3000,
          queue: false,
        });
      }
    },
    async startRedeem() {
      this.isRedeeming = true;
      const redeemCode = window.prompt('Please enter redeem code');
      try {
        await API.redeemCodeAsync({ code: redeemCode });
        this.$toast.open({
          message: 'Redeem badge successfully.',
          type: 'is-success',
          duration: 3000,
          queue: false,
        });
        this.$store.dispatch('updateMyCheckInStatus');
      } catch (e) {
        this.$toast.open({
          message: `Redeem failed: ${e.message}`,
          type: 'is-danger',
          duration: 3000,
          queue: false,
        });
      }
      this.isRedeeming = false;
    },
    CloseAboutView() {
      this.aboutShow = !this.aboutShow;
    },
    CloseTokenView() {
      this.tokenShow = !this.tokenShow;
    },
    CloseMobileAboutView() {
      this.mobileAboutShow = !this.mobileAboutShow;
    },
    CloseMobileTokenView() {
      this.mobileTokenShow = !this.mobileTokenShow;
    },
    changeInviteStatus() {
      this.isInviteDialogActive = true;
    },
    taggleMyPortal () {
      this.isShowMylangd = !this.isShowMylangd
    },
    closeMyPortal () {
      this.portalShow = false
    },
    getLangCode () {
      let language = localStorage.getItem('language') || (navigator.language.toLowerCase() === 'zh-tw' ? 'zh_tw' : navigator.language.split('-')[0])
      this.i18nCode = ['en', 'ja', 'ko', 'ru', 'zh', 'zh_tw'].includes(language) ? language : 'en'
    }
  },
  watch: {
    i18nCode (val) {
      this.$i18n.locale = val
      localStorage.setItem('language', val)
    },
    landInfo (landInfo) {
      if (!this.myLangdArr.length && landInfo && this.scatterAccount && this.scatterAccount.name) {
        console.log(1)
     
        var myLangdArr = []
        for (let key in landInfo) {
          if (landInfo[key].owner === this.scatterAccount.name) {
            myLangdArr.push({
              price: landInfo[key].price,
              name: landInfo[key]
            })
          }
        }
        this.myLangdArr = myLangdArr
      }
    },
    scatterAccount (scatterAccount) {
      // console.log()
      if (!this.myLangdArr.length && this.landInfo && scatterAccount && scatterAccount.name) {
       console.log(2)
        var myLangdArr = []
        for (let key in this.landInfo) {
          if (this.landInfo[key].owner === scatterAccount.name) {
            myLangdArr.push({
              price: this.landInfo[key].price,
              name: this.landInfo[key]
            })
          }
        }
        this.myLangdArr = myLangdArr
      }
    }
  },
  computed: {
    ...mapState(['landInfo','landInfoUpdateAt', 'isScatterConnected', 'scatterAccount', 'isScatterLoggingIn', 'balances', 'marketInfo', 'stakedInfo', 'globalInfo', 'dividendInfo', 'myCheckInStatus']),
    ...mapState('ui', ['navBurgerVisible', 'latestBuyerVisible', 'globalSpinnerVisible', 'globalProgressVisible', 'globalProgressValue']),
  },
  mounted() {
    this.connectScatterAsync();
    this.updateLandInfoAsync();
    this.updateMarketInfoAsync();
    this.getGlobalInfo();
    setInterval(() => {
      this.updateLandInfoAsync();
    }, 30 * 1000);
  },
  beforeDestroy () {
    Global.$off('onLoadMap')
    Global.$off('portalList')
  },
};
</script>

<style lang="sass">
@import "~mapbox-gl/dist/mapbox-gl.css";
@import "~bulma";
@import "~buefy/src/scss/buefy";
a:hover
  text-decoration: underline
.is-inverted > .select
  & select
    background: rgba(#000, 0.7)
    border-color: transparent
    color: #FFF
    &:hover
      border-color: rgba(#FFF, 0.4)
  &:not(.is-multiple):not(.is-loading):hover::after
    border-color: #FFF
.select select option
  color: #FFF
.modal-card
  box-shadow: 0 0 30px $primary
</style>

<style lang="sass" scoped>
.mylangd 
  position: absolute
  left: 20px
  top: 100px
  bottom: 100px
  right: 20px
  z-index: 999
  background: rgb(25, 25, 25)
  overflow-y: scroll
  padding-top: 20px

.no-langd
  text-align: center
  font-size: 12px
  padding: 50px 0
  color: #fff

.mylangd-item
  font-size: 12px
  color: #fff
  padding-left: 20px
  margin-bottom: 20px

.close-mylangd
  position: absolute
  right: 20px
  top: 20px
  cursor: pointer
  width: 24px
  height: 24px

  img
    display: block
    width: 24px
    height: 24px
#app
  position: absolute
  left: 0
  top: 0
  width: 100%
  height: 100%
  overflow: hidden
.app-nav
  position: absolute
  left: 2rem
  top: 2rem
  z-index: 1
  display: flex
  flex-direction: row
  justify-content: flex-start
.nav-item
  margin-right: 1rem
  color: rgba(#FFF, 0.8)
  user-select: none
  text-shadow: 1px 1px 2px rgba(#000, 0.5)
  &:hover
    color: #FFF
  &.router-link-exact-active
    color: $primary
.app-footer
  position: absolute
  left: 2rem
  right: 2rem
  bottom: 2rem
  z-index: 1
  display: flex
  flex-direction: row
  justify-content: center
  align-items: center
  text-shadow: 1px 1px 2px rgba(#000, 0.5)
  a:hover
    text-decoration: none
.footer-item
  margin: 0 0.5rem
  font-size: $size-7
.app-nav-burger
  position: relative
  left: 0
  top: 0
  z-index: 5
  color: #FFF
  +hamburger($app-nav-height)
  cursor:auto
  a
    display: block
    color: #FFF
    width: 3rem
    height: 3rem
    cursor: pointer
.app-nav-expand
  position: absolute
  left: 0
  top: 0
  width: 100%
  height: 100%
  z-index: 4
  background: rgba(#000, 0.9)
  padding-top: $app-nav-height
  &-item
    display: block
    width: 100%
    padding: 1rem
    border-top: 1px solid rgba(#FFF, 0.2)
    color: #FFF
    font-size: $size-7
    &:hover
      text-decoration: none
      background: rgba(#FFF, 0.1)
.country-detail
  position: absolute
  left: 0
  top: 0
  height: 100%
  z-index: 2
  pointer-events: none
  transition: background .5s ease-out
  width: 550px
  display: flex
  flex-direction: column
  &.is-active
    pointer-events: auto
    background: rgba(#000, 0.8)
  +mobile
    width: 100%
.mobile-back-button
  width: $app-nav-height
  height: $app-nav-height
  margin: 0
  display: flex
  justify-content: center
  align-items: center
.country-select
  +mobile
    margin: 0 0.5rem 0 0
    width: calc(100vw - #{$app-nav-height} - 0.5rem)
  .back-button
     position: absolute !important
     top: 2px  !important
     left: 10px  !important
.badgeList
  margin: 1rem 0
.app-map-login
    position: absolute
    left: 5rem
    top: .6rem
</style>
