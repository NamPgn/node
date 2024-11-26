import category from "./module/category";

const updateDocuments = async () => {
  try {
    // Cập nhật tất cả các tài liệu trong bộ sưu tập
    const result = await category.updateMany(
      {},
      {
        $set: {
          year: "2023",
          isActive: 0,
          time: "15-20 Phút",
        },
      }
    );

  } catch (error) {
    console.error("Error updating documents:", error);
  }
};
// const updateDocuments = async () => {
//   try {
//     // Cập nhật tất cả các tài liệu trong bộ sưu tập
//     const result = await category.updateMany(
//       {},
//       {
//         $set: {
//           country: "Chenese",
//           lang: "Vietsub",
//           quality: "HĐ",
//         },
//       }
//     );
//     console.log("thành công");
//   } catch (error) {
//     console.error("Error updating documents:", error);
//   }
// };

// app.get("/sitemap.xml", async (req, res) => {
//   const dataCategory = await category.find();
//   const dataProducts = await products.find();
//   const renderDataCategorys = dataProducts.map((item) => {
//     return {
//       loc: `https://tromphim.site/d/${item.slug}`,
//       lastmod: new Date().toISOString(),
//     };
//   });
//   const renderDataProducts = dataCategory.map((item) => {
//     return {
//       loc: `https://tromphim.site/d/${item.slug}`,
//       lastmod: new Date().toISOString(),
//     };
//   });
//   Đặt tiêu đề Content-Type là XML
//   res.header("Content-Type", "application/xml");
//   const dataArr = [...renderDataCategorys, ...renderDataProducts];
//   const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
//   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//     ${dataArr
//       .map((url: any) => {
//         return `
//         <url>
//           <loc>${url.loc}</loc>
//           <lastmod>${url.lastmod}</lastmod>
//         </url>
//         `;
//       })
//       .join("")}
//   </urlset>
//   `;

//   Gửi nội dung sitemap về client
//   res.send(sitemap);
// });