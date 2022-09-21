const routes = [
    {
        path: "",
        name: "MainPage",
        component: () => import("../views/MainPage.vue"),
    },
    {
        path: "apartmentArea",
        name: "apartmentArea",
        component: () => import("../views/ApartmentArea2.vue"),
    },
    {
        path: "buildingdetail",
        name: "buildingdetail",
        component: () => import("../views/BuildingDetail.vue")
    }
]
export default routes