<template>
   <div>
    <div class="home-v3">
        <AMenu></AMenu>
       <div class="content-v3">
        <router-view></router-view>
       </div>
    </div>
   </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Menu from './menu/index.vue'

@Component({
    name: "Home",
    components: {
        AMenu: Menu
    }
})
export default class Home extends Vue { }
</script>

<style scoped lang="less">
.home-v3{
    display: grid;
    grid-template-columns: 70px 1fr;
    grid-column-gap: 10px;
    grid-template-rows: 1fr;
    width: 100%;
    height:100%;
    background: #1d2730;
    .content-v3{
        width:100%;
        height:100%;
        background: #404955;
    }
}
</style>

