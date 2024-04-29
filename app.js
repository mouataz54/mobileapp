const express = require('express');
const multer = require('multer');
const cors = require('cors'); 
const morgan = require('morgan'); 
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');
const Image = require('./imageModel');


// Connectez-vous à votre base de données MongoDB
mongoose.connect('mongodb+srv://moatazbouazizi5:rXLZuEqdacyqinHD@cluster0.2lbhmp8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});
// Configuration de Cloudinary avec vos identifiants
cloudinary.config({ 
    cloud_name: 'do8wbzjdr', 
    api_key: '652884344331972', 
    api_secret: 'sUFDPs-54ONiOw5es-Y_Xgtam7U' 
});

// Middleware pour activer CORS
app.use(cors());

// Middleware pour journaliser les requêtes HTTP
app.use(morgan('dev'));

// Configuration du stockage avec Cloudinary pour les images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'images', // Dossier de destination pour les images sur Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'], // Formats d'image autorisés
    resource_type: 'auto' // Type de ressource (image, video, raw)
  }
});

// Configuration du stockage avec Cloudinary pour les vidéos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'videos', // Dossier de destination pour les vidéos sur Cloudinary
    allowed_formats: ['mp4', 'webm', 'ogg'], // Formats vidéo autorisés
    resource_type: 'auto' // Type de ressource (image, video, raw)
  }
});

// Initialisation de Multer avec le stockage Cloudinary pour les images
const uploadImage = multer({ storage: imageStorage });

// Initialisation de Multer avec le stockage Cloudinary pour les vidéos
const uploadVideo = multer({ storage: videoStorage });

// Définition du point de terminaison pour le téléchargement des images
app.post('/upload/image', uploadImage.single('file'), async (req, res) => {
    try {
        console.log('Image reçue: ', req.file);

        // Enregistrez le chemin de l'image dans la base de données MongoDB
        const imagePath = req.file.path;
        const image = new Image({ path: imagePath });
        await image.save();

        res.send({ message: 'Image téléchargée et enregistrée avec succès!', fileUrl: imagePath });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).send({ message: 'Une erreur s\'est produite lors du téléchargement de l\'image.' });
    }
});

// Définition du point de terminaison pour le téléchargement des vidéos
app.post('/upload/video', uploadVideo.single('file'), (req, res) => {
    console.log('Vidéo reçue: ', req.file);
    res.send({ message: 'Vidéo téléchargée avec succès!', fileUrl: req.file.path });
});


app.get('/images', async (req, res) => {
  try {
      const images = await Image.find(); // Récupérer toutes les images depuis la base de données
      res.json(images); // Renvoyer les images sous forme de JSON
  } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).send('Une erreur s\'est produite lors de la récupération des images.');
  }
});

app.get('/images/:startDate/:endDate', async (req, res) => {
  try {
    // Convertir les dates de début et de fin en objets Date
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate);

    // Récupérer les images dans l'intervalle de dates spécifié
    const images = await Image.find({ timestamp: { $gte: startDate, $lte: endDate } });

    res.json(images); // Renvoyer les images sous forme de JSON
  } catch (error) {
    console.error('Erreur lors de la récupération des images dans l\'intervalle de dates :', error);
    res.status(500).send('Une erreur s\'est produite lors de la récupération des images dans l\'intervalle de dates spécifié.');
  }
});



// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
