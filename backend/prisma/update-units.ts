import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Products that should have 'pak' unit
const pakProducts = [
  'Cello Pen Blue',
  'Bic Pen',
  'Black Cello Pen',
  'Fastener',
  'White Board Marker',
  'Staples Wire Large Kangaro',
  'Staples Wire 369',
  'Staples Wire Heavy Duty',
  'Flip Chart',
  'Ring 8mm',
  'Ring 10mm',
  'Ring 6mm',
  'Ring 12mm',
  'Ring 18mm',
  'Black Board Duster Omega',
  'White Post',
  'Paper Clip Agraf 33mm',
  'Paper Clip Agraf 50mm',
  'Protractor',
  'Screw 8',
  'CD-R',
  'DVD-R',
  'Eraser Rubber',
];

async function main() {
  console.log('🔄 Updating product units...');
  
  // Update pak products
  const pakResult = await prisma.product.updateMany({
    where: {
      name: { in: pakProducts },
    },
    data: {
      unit: 'pak',
      piecesPerUnit: 10,
    },
  });
  
  console.log(`✅ Updated ${pakResult.count} products to 'pak' unit`);
  
  // Update reem products
  const reemProducts = [
    'Paper Roadmap A4',
    'Paper Gold A4',
    'Color Paper (Spectra)',
    'Khaki Post A5 Size',
    'Color Paper A4 Renbo',
    'Carbo 8000H',
    'Transparent Cover',
    'Hard Cover',
    'Khaki Post A4 Size',
    'Khaki Post A3 Size',
  ];
  
  const reemResult = await prisma.product.updateMany({
    where: {
      name: { in: reemProducts },
    },
    data: {
      unit: 'reem',
      piecesPerUnit: 500,
    },
  });
  
  console.log(`✅ Updated ${reemResult.count} products to 'reem' unit`);
  
  // Set all other products without unit to 'pcs'
  const pcsResult = await prisma.product.updateMany({
    where: {
      unit: null,
    },
    data: {
      unit: 'pcs',
      piecesPerUnit: 1,
    },
  });
  
  console.log(`✅ Updated ${pcsResult.count} products to 'pcs' unit`);
  console.log('✅ All units updated successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

