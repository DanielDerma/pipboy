"use client"

import { useEffect } from "react"

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then(
            (registration) => {
              console.log("Service Worker registration successful with scope: ", registration.scope)
            },
            (err) => {
              console.log("Service Worker registration failed: ", err)
            },
          )
          .catch((err) => {
            console.log(err)
          })
      })
    } else {
      console.log("Service Worker is not supported by browser.")
    }
  }, [])

  return null
}
