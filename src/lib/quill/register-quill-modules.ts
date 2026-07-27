import Quill from 'quill'
import Image from 'quill/formats/image'
import TableUp, {
  defaultCustomSelect,
  TableAlign,
  TableMenuContextmenu,
  TableResizeScale,
  TableSelection,
} from 'quill-table-up'
import 'quill-table-up/index.css'
import 'quill-table-up/table-creator.css'

let registered = false

class BlobFriendlyImage extends Image {
  static sanitize(url: string): string {
    if (url.startsWith('blob:')) {
      return url
    }

    return Image.sanitize(url)
  }
}

export function registerQuillModules() {
  if (registered) return

  Quill.register({ 'formats/image': BlobFriendlyImage }, true)
  Quill.register({ [`modules/${TableUp.moduleName}`]: TableUp }, true)
  registered = true
}

export { TableUp, defaultCustomSelect, TableAlign, TableMenuContextmenu, TableResizeScale, TableSelection }
