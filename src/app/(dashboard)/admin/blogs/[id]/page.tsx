import BlogFormPage from '@/components/admin/blog/blog-form-page'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function BlogCreateAndUpdatePage({ params }: PageProps) {
  const { id } = await params

  return <BlogFormPage blogId={id} />
}
