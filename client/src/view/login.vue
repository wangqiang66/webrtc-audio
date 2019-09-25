<!--
  function: index
  author  : wq
  update  : 2019/6/18 14:56
-->
<template>
  <div class="full-width full-height row flex-middle flex-center" style="padding-bottom: 30%;">
    <div class="login-box">
      <div class="full-width">
        <label class="padding-gap-small-b color-label">类型：</label>
        <select v-model="kind" class="form-control">
          <option :value="0">客服</option>
          <option :value="1">客户</option>
        </select>
      </div>
      <div class="full-width">
        <label class="padding-gap-small-b color-label">用户名：</label>
        <input v-model="name" class="form-control" />
      </div>
      <button class="btn btn-default full-width" style="margin-top: 20px" @click="beginAudio">开始视频</button>
      <br />
    </div>
  </div>
</template>

<script>

export default {
  name: 'Login',
  data() {
    return {
      kind: 1,
      name: 'web_test_1'
    }
  },
  methods: {
    beginAudio() {
      const {
        name, kind
      } = this
      if (!name || kind <= -1) {
        alert('请先填写完整数据')
        console.log('error')
        return false
      }
      this.$router.push(`/audio/${kind}/${name}`)
    }
  }
}
</script>
