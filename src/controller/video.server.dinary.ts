// const Vimeo = require('vimeo').Vimeo;

// const CLIENT_ID = 'f25b47c148b08f6efbb8df96bd59f79b66d9b907';
// const CLIENT_SECRET = 'xAscFLIGCQ29buSFkxiC59nbl7DheK/PhIvgDCv73Bs6TPIMxaBg28F3KWQHIXWNO1XzcvQA3kNO0wELiLMrqAjCBacVrjTgaY9odb1Nl2JAv+BQBbwzMfAtVt6fT3Ej';
// const ACCESS_TOKEN = '2da655d477f344aa9f2567b62c30d237';

// const client = new Vimeo(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN);


export const uploadVimeo = (req, res) => {
  const data = req.file.path
  // try {
  //   const q = client.upload(
  //     data,
  //     {
  //       name: 'My Video',
  //       description: 'This is my video',
  //     },
  //     function (uri) {
  //       client.request(uri, function (error, body, status_code, headers) {
  //         if (error) {
  //           reject(error);
  //         } else {
  //           console.log(body.link)
  //         }
  //       });
  //     },
  //     function (bytes_uploaded, bytes_total) {
  //       const percentage = ((bytes_uploaded / bytes_total) * 100).toFixed(2);
  //       console.log(`Uploaded: ${bytes_uploaded}/${bytes_total} (${percentage}%)`);
  //     },
  //     function (error) {
  //       console.error(error);
  //     }
  //   );
  //   console.log(q);
  // } catch (error) {

  // }
}