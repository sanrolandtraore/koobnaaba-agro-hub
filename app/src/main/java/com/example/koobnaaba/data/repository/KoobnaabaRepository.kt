package com.example.koobnaaba.data.repository

import com.example.koobnaaba.data.local.KoobnaabaDao
import com.example.koobnaaba.data.model.*
import kotlinx.coroutines.flow.Flow

class KoobnaabaRepository(private val dao: KoobnaabaDao) {

    // Farms
    val allFarms: Flow<List<Farm>> = dao.getAllFarms()
    suspend fun insertFarm(farm: Farm): Long = dao.insertFarm(farm)
    suspend fun updateFarm(farm: Farm) = dao.updateFarm(farm)
    suspend fun deleteFarm(farm: Farm) = dao.deleteFarm(farm)
    suspend fun deleteFarmById(id: Long) = dao.deleteFarmById(id)

    // Parcels
    val allParcels: Flow<List<Parcel>> = dao.getAllParcels()
    fun getParcelsByFarm(farmId: Long): Flow<List<Parcel>> = dao.getParcelsByFarm(farmId)
    suspend fun insertParcel(parcel: Parcel): Long = dao.insertParcel(parcel)
    suspend fun updateParcel(parcel: Parcel) = dao.updateParcel(parcel)
    suspend fun deleteParcel(parcel: Parcel) = dao.deleteParcel(parcel)

    // Crop Cycles
    val allCropCycles: Flow<List<CropCycle>> = dao.getAllCropCycles()
    val activeCropCycles: Flow<List<CropCycle>> = dao.getActiveCropCycles()
    suspend fun insertCropCycle(cycle: CropCycle): Long = dao.insertCropCycle(cycle)
    suspend fun updateCropCycle(cycle: CropCycle) = dao.updateCropCycle(cycle)
    suspend fun deleteCropCycle(cycle: CropCycle) = dao.deleteCropCycle(cycle)

    // Activities
    val allActivities: Flow<List<ActivityLog>> = dao.getAllActivities()
    suspend fun insertActivity(activity: ActivityLog): Long = dao.insertActivity(activity)
    suspend fun deleteActivity(activity: ActivityLog) = dao.deleteActivity(activity)

    // Costs
    val allCosts: Flow<List<CostEntry>> = dao.getAllCosts()
    suspend fun insertCost(cost: CostEntry): Long = dao.insertCost(cost)
    suspend fun deleteCost(cost: CostEntry) = dao.deleteCost(cost)

    // Harvests
    val allHarvests: Flow<List<Harvest>> = dao.getAllHarvests()
    suspend fun insertHarvest(harvest: Harvest): Long = dao.insertHarvest(harvest)

    // Animals & Livestock
    val allAnimals: Flow<List<Animal>> = dao.getAllAnimals()
    val activeAnimals: Flow<List<Animal>> = dao.getActiveAnimals()
    suspend fun insertAnimal(animal: Animal): Long = dao.insertAnimal(animal)
    suspend fun updateAnimal(animal: Animal) = dao.updateAnimal(animal)
    suspend fun deleteAnimal(animal: Animal) = dao.deleteAnimal(animal)

    val allHealthEvents: Flow<List<AnimalHealthEvent>> = dao.getAllHealthEvents()
    suspend fun insertHealthEvent(event: AnimalHealthEvent): Long = dao.insertHealthEvent(event)

    val allReproductionEvents: Flow<List<AnimalReproduction>> = dao.getAllReproductionEvents()
    suspend fun insertReproductionEvent(repro: AnimalReproduction): Long = dao.insertReproductionEvent(repro)
}
