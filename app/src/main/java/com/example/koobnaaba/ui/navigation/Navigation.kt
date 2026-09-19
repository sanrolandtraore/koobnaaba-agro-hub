package com.example.koobnaaba.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Home : Screen("home", "Accueil", Icons.Default.Home)
    object Farms : Screen("farms", "Fermes", Icons.Default.Landscape)
    object Parcels : Screen("parcels", "Parcelles", Icons.Default.GridOn)
    object Crops : Screen("crops", "Cultures", Icons.Default.Eco)
    object Activities : Screen("activities", "Activités", Icons.Default.Assignment)
    object Finances : Screen("finances", "Finances", Icons.Default.AccountBalanceWallet)
    object Livestock : Screen("livestock", "Élevage", Icons.Default.Pets)
    object Calculator : Screen("calculator", "Calculs", Icons.Default.Calculate)
}

val bottomNavItems = listOf(
    Screen.Home,
    Screen.Parcels,
    Screen.Crops,
    Screen.Livestock,
    Screen.Calculator
)
