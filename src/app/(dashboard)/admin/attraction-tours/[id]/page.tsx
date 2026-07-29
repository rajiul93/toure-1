import AttractionTourForm from '@/components/admin/attraction-tours/attraction-tour-form'
import { getAttractionTourFromDB } from '@/lib/services/attraction-tour.service'
import { createPrivatePageMetadata } from '@/lib/metadata'
import { notFound } from 'next/navigation'

export const metadata = createPrivatePageMetadata({
  title: 'Edit attraction tour',
  description: 'Create or edit an attraction tour.',
  path: '/admin/attraction-tours',
})

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function AttractionTourEditPage({ params }: Props) {
  const { id } = await params

  if (id === 'new') {
    return <AttractionTourForm mode="create" tourId="new" />
  }

  const tour = await getAttractionTourFromDB(id)
  if (!tour) notFound()

  return <AttractionTourForm mode="update" tourId={id} initialValues={tour} />
}
