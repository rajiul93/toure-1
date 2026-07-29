import AdminAttractionToursClient from '@/components/admin/attraction-tours/admin-attraction-tours-client'
import { createPrivatePageMetadata } from '@/lib/metadata'

export const metadata = createPrivatePageMetadata({
  title: 'Attraction tours',
  description: 'Manage Day Tour Paris attraction tours.',
  path: '/admin/attraction-tours',
})

export const dynamic = 'force-dynamic'

export default function AdminAttractionToursPage() {
  return <AdminAttractionToursClient />
}
