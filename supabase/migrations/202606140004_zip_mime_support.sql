update storage.buckets
set allowed_mime_types = array[
  'application/zip',
  'application/x-zip-compressed',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]
where id = 'product-files';
