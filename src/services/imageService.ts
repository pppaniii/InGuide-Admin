import axios from 'axios'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
})

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await httpClient.post('/uploadImage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.url
  } catch (err) {
    console.error('Image upload failed:', err)
    throw err
  }
}

export async function deleteImage(url: string): Promise<void> {
  await httpClient.delete('/uploadImage', {
    data: { 'url': url },
  })
}


export default {
  uploadImage,
  deleteImage,
}
