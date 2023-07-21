import { Component, Vue } from 'vue-property-decorator';
import {Collapse,Timeline,Icon} from "@h3/antd-vue"
@Component({
  name:"ProjectTrack",
  components:{
    [Collapse.name]:Collapse,
    [Collapse.Panel.name]:Collapse.Panel,
    [Timeline.name]:Timeline,
    [Timeline.Item.name]:Timeline.Item,
    [Icon.name]:Icon,
  }
})
export default class ProjectTrack extends Vue {

}
