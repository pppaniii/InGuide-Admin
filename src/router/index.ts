import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/DashboardView.vue'
import BuildingLayout from '@/views/LayoutView.vue'

import FloorPlanView from '@/views/features/FloorPlanView.vue'
import POIsView from '@/views/features/POIsView.vue'
import WalkwaysView from '@/views/features/WalkwaysView.vue'
import BeaconsView from '@/views/features/BeaconsView.vue'

import { useBuildings } from '@/stores/buildings'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard,
    },
    {
      path: '/building/:id',
      name: 'building',
      component: BuildingLayout,
      props: true,
      
      beforeEnter: (to) => {
        const id = String(to.params.id)
        const store = useBuildings()

        return store.fetchById(id)
        .then((b) => {
          if (!b){
            return { name: 'home' } // redirect if not found
          }
        })
        .catch(() => {
          return { name: 'home'} // network/error fallback
        })
      },
      children: [
        { path: '', 
          redirect: { name: 'building-floorplan' } 
        },
        {
          path: 'floorplan',
          name: 'building-floorplan',
          component: FloorPlanView,
          props: true
        },
        {
          path: 'pois',
          name: 'building-pois',
          component: POIsView,
          props: true
        },
        {
          path: 'walkway',
          name: 'building-walkway',
          component: WalkwaysView,
          props: true
        },
        {
          path: 'beacons',
          name: 'building-beacons',
          component: BeaconsView,
          props: true
        },
      ]
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
