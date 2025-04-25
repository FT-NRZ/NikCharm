import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Define the path to your local JSON file
    const filePath = path.join(process.cwd(), 'app', 'data', 'products.json');

    // Check if the file exAists
    try {
      await fs.access(filePath);
    } catch {
      // If the file doesn't exist, create it with an empty products array
      await fs.writeFile(filePath, JSON.stringify({ products: [] }, null, 2));
    }

    // Read the current contents of the JSON file
    const fileData = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileData);

    // Return the products data
    return new Response(JSON.stringify(jsonData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('خطا در دریافت اطلاعات:', error);
    return new Response(JSON.stringify({ error: 'خطا در دریافت اطلاعات' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    // Parse the incoming JSON data from the request body
    const newProduct = await request.json();

    // Validate the incoming product data
    if (
      !newProduct.id ||
      !newProduct.name ||
      !newProduct.price ||
      typeof newProduct.price !== 'number' ||
      !newProduct.originalPrice ||
      typeof newProduct.originalPrice !== 'number'
    ) {
      return new Response(
        JSON.stringify({ error: 'داده‌های ورودی نامعتبر هستند' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Define the path to your local JSON file
    const filePath = path.join(process.cwd(), 'app', 'data', 'products.json');

    // Check if the file exists
    try {
      await fs.access(filePath);
    } catch {
      // If the file doesn't exist, create it with an empty products array
      await fs.writeFile(filePath, JSON.stringify({ products: [] }, null, 2));
    }

    // Read the current contents of the JSON file
    const fileData = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileData);

    // Append the new product to the products array
    jsonData.products.push(newProduct);

    // Write the updated data back to the file (formatted with 2-space indent for readability)
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));

    return new Response(JSON.stringify({ message: 'محصول با موفقیت ایجاد شد!' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('خطا:', error);
    return new Response(JSON.stringify({ error: 'خطا در ذخیره اطلاعات' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}