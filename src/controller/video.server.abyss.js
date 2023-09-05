import Products from '../module/products';
import videoServerAbyss from '../module/video.server.abyss';
const fs = require('fs');

export const uploadServer2 = (req, res) => {
  try {
    const videoFilePath = req.file.path;

    //abyss
    const request = require('request');
    const formData = {
      file: {
        value: fs.createReadStream(videoFilePath),
        options: {
          filename: 'video.mp4',
          contentType: 'video/mp4'
        }
      }
    };

    request.post({ url: 'http://up.hydrax.net/293440e1c239317fd41793ae59d38192', formData: formData }, async function (err, httpResponse, body) {
      if (err) {
        res.status(500).send('Internal server error');
      } else {
        const abyssUrl = 'https://short.ink/' + JSON.parse(body).slug;
        await new videoServerAbyss({
          url: abyssUrl
        }).save();
        await Products.updateOne({ _id: req.params.id }, {
          server2: abyssUrl
        });
        return res.json(abyssUrl);
      }
    })
  } catch (error) {
    if (error) {
      res.status(500).json('Internal server error');
    } else {
      res.json('Video uploaded successfully');
    }
  }
}