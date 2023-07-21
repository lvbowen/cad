import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import UploadAdapterPlugin from "./UploadAdapter";
import '@ckeditor/ckeditor5-build-classic/build/translations/zh-cn';
import CKEditor from '@ckeditor/ckeditor5-vue2';
import * as tsx from 'vue-tsx-support';


@Component({
  name: 'RichText',
  components: {
    Ckeditor: CKEditor.component
  }
})
export default class RichText extends Vue {

  _tsx!: tsx.DeclareProps<Pick<RichText, 'objectId' | 'contentValue'>>;

  private enable: boolean = true;

  public content: string | null = null;

  @Prop() objectId!: string;

  @Prop() contentValue?: string | null;

  @Prop() disabled?: boolean;

  @Watch('contentValue', { immediate: true })
  contentValueListener(value: string) {
    this.content = value;
  }

  richTextInput(text: string) {
    this.content = text;
  }

  render() {
    const { enable, content, richTextInput, disabled } = this;
    return (
      <div>
        {
          enable &&
          <CKEditor.component
            disabled={disabled}
            editor={ClassicEditor}
            value={content}
            onInput={richTextInput}
            config={{
              extraPlugins: [ UploadAdapterPlugin ],
              toolbar: {
                items: [
                  'heading',
                  '|',
                  'bold',
                  // 'italic',
                  'link',
                  'bulletedList',
                  'numberedList',
                  '|',
                  'indent',
                  'outdent',
                  '|',
                  'imageUpload',
                  'blockQuote',
                  'insertTable',
                  // 'mediaEmbed',
                  'undo',
                  'redo'
                ]
              },
              language: 'zh-cn',
              image: {
                styles: [
                  'alignLeft', 'alignCenter', 'alignRight'
                ],
                resizeOptions: [
                  {
                    name: 'imageResize:original',
                    label: 'Original',
                    value: null
                  },
                  {
                    name: 'imageResize:50',
                    label: '50%',
                    value: '50'
                  },
                  {
                    name: 'imageResize:75',
                    label: '75%',
                    value: '75'
                  }
                ],

                toolbar: [
                  'imageTextAlternative',
                  'imageStyle:full',
                  'imageStyle:side',
                  'imageStyle:alignLeft',
                  'imageStyle:alignCenter',
                  'imageStyle:alignRight',
                ]
              }
            }}/>
        }
      </div>
    );
  }
}
