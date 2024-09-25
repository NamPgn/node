export const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/đ/g, "d") 
    .replace(/Đ/g, "D");
};
export const slugify = (text) => {
  return removeVietnameseTones(text) 
    .toLowerCase()                  
    .trim()                         
    .replace(/[\s\W-]+/g, "-")       
    .replace(/^-+|-+$/g, "");      
};