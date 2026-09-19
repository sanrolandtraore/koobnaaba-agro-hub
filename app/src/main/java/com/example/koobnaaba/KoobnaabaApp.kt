package com.example.koobnaaba

import android.app.Application
import com.example.koobnaaba.data.local.AppDatabase
import com.example.koobnaaba.data.repository.KoobnaabaRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob

class KoobnaabaApp : Application() {
    private val applicationScope = CoroutineScope(SupervisorJob())

    val database by lazy { AppDatabase.getDatabase(this, applicationScope) }
    val repository by lazy { KoobnaabaRepository(database.koobnaabaDao()) }
}
