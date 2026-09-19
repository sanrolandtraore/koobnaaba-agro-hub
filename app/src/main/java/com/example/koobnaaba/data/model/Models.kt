package com.example.koobnaaba.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "farms")
data class Farm(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val locationName: String,
    val totalAreaHa: Double,
    val climateZone: String = "Nord-Soudanien",
    val latitude: Double? = null,
    val longitude: Double? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "parcels")
data class Parcel(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val farmId: Long,
    val name: String,
    val areaHa: Double,
    val soilType: String = "Argilo-limoneux",
    val irrigationType: String = "Goutte-à-goutte",
    val polygonGps: String = "", // Geo points
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "crop_cycles")
data class CropCycle(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val parcelId: Long,
    val cropName: String,
    val cropCategory: String, // Céréales, Légumineuses, Maraîchage, etc.
    val season: String, // Hivernage, Saison sèche chaude, Saison sèche fraîche
    val plantingDate: String,
    val expectedHarvestDate: String,
    val expectedYieldKg: Double,
    val status: String = "active", // active, harvested, planned, failed
    val notes: String = ""
)

@Entity(tableName = "activity_logs")
data class ActivityLog(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val cropCycleId: Long? = null,
    val parcelId: Long? = null,
    val activityType: String, // Semis, Irrigation, Fertilisation, Sarclage, Traitement, Récolte
    val description: String,
    val date: String,
    val costAmount: Double = 0.0,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "cost_entries")
data class CostEntry(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val category: String, // Semences, Engrais, Main d'oeuvre, Carburant, Équipement, Autre
    val description: String,
    val amount: Double, // in FCFA
    val date: String,
    val cropCycleId: Long? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "harvests")
data class Harvest(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val cropCycleId: Long,
    val quantityKg: Double,
    val unitPriceFcfa: Double,
    val date: String,
    val qualityGrade: String = "Standard", // Extra, Premier Choix, Standard
    val storageLocation: String = "Magasin principal"
)

@Entity(tableName = "animals")
data class Animal(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val tagNumber: String,
    val species: String, // bovin, ovin, caprin, porcin, volaille, pisciculture
    val breed: String,
    val gender: String, // M, F
    val birthDate: String,
    val weightKg: Double,
    val status: String = "actif", // actif, vendu, soigné, décédé
    val groupSize: Int = 1,
    val isGroup: Boolean = false,
    val notes: String = ""
)

@Entity(tableName = "animal_health_events")
data class AnimalHealthEvent(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val animalId: Long,
    val eventType: String, // Vaccination, Déparasitage, Traitement, Chirurgie
    val medicineName: String,
    val date: String,
    val costFcfa: Double = 0.0,
    val notes: String = ""
)

@Entity(tableName = "animal_reproductions")
data class AnimalReproduction(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val animalId: Long,
    val matingDate: String,
    val expectedBirthDate: String,
    val actualBirthDate: String? = null,
    val offspringCount: Int = 0,
    val status: String = "en_gestation" // en_gestation, mis_bas, avortement
)

data class BurkinaCrop(
    val key: String,
    val label: String,
    val group: String,
    val cycleDays: Int,
    val avgYieldKgPerHa: Double,
    val waterNeedsMm: Int
)

object BurkinaCropData {
    val CROPS = listOf(
        BurkinaCrop("mil", "Mil (Souna)", "Céréales", 90, 1200.0, 450),
        BurkinaCrop("sorgho_blanc", "Sorgho blanc", "Céréales", 110, 1500.0, 500),
        BurkinaCrop("mais", "Maïs hybride", "Céréales", 100, 3500.0, 600),
        BurkinaCrop("riz_bas_fond", "Riz de bas-fond", "Céréales", 120, 4000.0, 800),
        BurkinaCrop("niebe", "Niébé (haricot)", "Légumineuses", 75, 1000.0, 350),
        BurkinaCrop("arachide", "Arachide", "Légumineuses", 90, 1400.0, 450),
        BurkinaCrop("soja", "Soja", "Légumineuses", 105, 1800.0, 550),
        BurkinaCrop("coton", "Coton", "Cultures de rente", 140, 1600.0, 700),
        BurkinaCrop("sesame", "Sésame blanc", "Cultures de rente", 85, 800.0, 400),
        BurkinaCrop("anacarde", "Anacardier (noix)", "Cultures de rente", 365, 900.0, 800),
        BurkinaCrop("tomate", "Tomate Roma", "Maraîchage", 80, 25000.0, 600),
        BurkinaCrop("oignon", "Oignon violet de Galmi", "Maraîchage", 110, 28000.0, 550),
        BurkinaCrop("chou", "Chou pommé", "Maraîchage", 75, 20000.0, 500),
        BurkinaCrop("aubergine", "Aubergine locale", "Maraîchage", 85, 15000.0, 450),
        BurkinaCrop("gombo", "Gombo", "Maraîchage", 65, 8000.0, 400),
        BurkinaCrop("piment", "Piment fort", "Maraîchage", 90, 6000.0, 500),
        BurkinaCrop("mangue", "Manguier Amélie/Kent", "Fruits", 365, 12000.0, 900),
        BurkinaCrop("banane", "Bananier doux", "Fruits", 300, 30000.0, 1200)
    )
}
