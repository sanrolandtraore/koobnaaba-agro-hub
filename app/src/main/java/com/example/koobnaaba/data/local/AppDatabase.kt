package com.example.koobnaaba.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.koobnaaba.data.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        Farm::class,
        Parcel::class,
        CropCycle::class,
        ActivityLog::class,
        CostEntry::class,
        Harvest::class,
        Animal::class,
        AnimalHealthEvent::class,
        AnimalReproduction::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun koobnaabaDao(): KoobnaabaDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "koobnaaba_database"
                )
                .fallbackToDestructiveMigration()
                .addCallback(DatabaseCallback(scope))
                .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback(
            private val scope: CoroutineScope
        ) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        populateInitialData(database.koobnaabaDao())
                    }
                }
            }

            private suspend fun populateInitialData(dao: KoobnaabaDao) {
                // Seed default Burkina farms
                val farm1Id = dao.insertFarm(
                    Farm(
                        name = "Ferme Espoir du Sahel",
                        locationName = "Bobo-Dioulasso",
                        totalAreaHa = 15.5,
                        climateZone = "Sud-Soudanien",
                        latitude = 11.1772,
                        longitude = -4.2979
                    )
                )
                val farm2Id = dao.insertFarm(
                    Farm(
                        name = "Domaine Agro-Sylvo de Loumbila",
                        locationName = "Loumbila (Oubritenga)",
                        totalAreaHa = 8.0,
                        climateZone = "Nord-Soudanien",
                        latitude = 12.5190,
                        longitude = -1.3980
                    )
                )

                // Seed parcels
                val parcel1Id = dao.insertParcel(
                    Parcel(
                        farmId = farm1Id,
                        name = "Parcelle Maraîchère A",
                        areaHa = 2.5,
                        soilType = "Limoneux riche",
                        irrigationType = "Goutte-à-goutte solaire",
                        polygonGps = "11.1772,-4.2979; 11.1775,-4.2970; 11.1768,-4.2965; 11.1765,-4.2975"
                    )
                )
                dao.insertParcel(
                    Parcel(
                        farmId = farm1Id,
                        name = "Verger Manguiers B",
                        areaHa = 6.0,
                        soilType = "Argilo-sableux",
                        irrigationType = "Micro-aspersion",
                        polygonGps = "11.1780,-4.2990; 11.1795,-4.2980; 11.1790,-4.2970; 11.1775,-4.2980"
                    )
                )

                // Seed active crop cycles
                val cycle1Id = dao.insertCropCycle(
                    CropCycle(
                        parcelId = parcel1Id,
                        cropName = "Oignon violet de Galmi",
                        cropCategory = "Maraîchage",
                        season = "Saison sèche fraîche",
                        plantingDate = "15/11/2025",
                        expectedHarvestDate = "15/03/2026",
                        expectedYieldKg = 70000.0,
                        status = "active",
                        notes = "Repiquage réussi, apport fumure organique 15t/ha"
                    )
                )

                // Seed sample activities
                dao.insertActivity(
                    ActivityLog(
                        cropCycleId = cycle1Id,
                        parcelId = parcel1Id,
                        activityType = "Irrigation",
                        description = "Cycle goutte-à-goutte 3h le matin",
                        date = "18/09/2026",
                        costAmount = 4500.0
                    )
                )
                dao.insertActivity(
                    ActivityLog(
                        cropCycleId = cycle1Id,
                        parcelId = parcel1Id,
                        activityType = "Fertilisation",
                        description = "Apport NPK 15-15-15 (150 kg)",
                        date = "12/09/2026",
                        costAmount = 45000.0
                    )
                )

                // Seed costs
                dao.insertCost(
                    CostEntry(
                        category = "Semences",
                        description = "Semences certifiées Oignon Galmi 5 boîtes",
                        amount = 65000.0,
                        date = "10/11/2025",
                        cropCycleId = cycle1Id
                    )
                )
                dao.insertCost(
                    CostEntry(
                        category = "Main d'oeuvre",
                        description = "Préparation des planches et repiquage",
                        amount = 40000.0,
                        date = "14/11/2025",
                        cropCycleId = cycle1Id
                    )
                )

                // Seed animals
                dao.insertAnimal(
                    Animal(
                        tagNumber = "BF-BOU-001",
                        species = "bovin",
                        breed = "Zébu Peul Goudali",
                        gender = "F",
                        birthDate = "12/04/2023",
                        weightKg = 340.0,
                        status = "actif",
                        notes = "Bonne productrice laitière"
                    )
                )
                dao.insertAnimal(
                    Animal(
                        tagNumber = "BF-OV-012",
                        species = "ovin",
                        breed = "Mouton Djallonké",
                        gender = "M",
                        birthDate = "10/01/2024",
                        weightKg = 45.0,
                        status = "actif",
                        notes = "Bélier reproducteur"
                    )
                )
                dao.insertAnimal(
                    Animal(
                        tagNumber = "LOT-VOL-2026",
                        species = "volaille",
                        breed = "Poulet local amélioré (Faso Faso)",
                        gender = "F",
                        birthDate = "01/06/2026",
                        weightKg = 1.6,
                        status = "actif",
                        isGroup = true,
                        groupSize = 150,
                        notes = "Lot pondeuses semi-intensif"
                    )
                )
            }
        }
    }
}
