import Head from 'next/head'

import useSWR from 'swr'

import Layout from '@components/Layout'
import Section from '@components/Section'
import Container from '@components/Container'
import Map from '@components/Map'

import styles from '@styles/Home.module.scss'

const fetcher = (url) => fetch(url).then((res) => res.json())

const sourceURL =
  'https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media&2018b'

const currentDate = new Date(Date.now())
const currentYear = currentDate.getFullYear()

function Home() {
  const { data } = useSWR(sourceURL, fetcher)

  const destinations = data?.destinations.map((destination) => {
    const { arrival, departure } = destination

    const arrivalDate = new Date(arrival)
    const departureDate = new Date(departure)

    arrivalDate.setFullYear(currentYear)
    departureDate.setFullYear(currentYear)

    return {
      ...destination,
      arrival: arrivalDate.getTime(),
      departure: departureDate.getTime(),
    }
  })

  return (
    <Layout>
      <Head>
        <title>Next Santa Tracking App</title>
        <meta name='description' content='Next Santa Tracking App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Section>
        <Container>
          <h1 className={styles.title}>Next Santa Tracking App</h1>

          <Map
            className={styles.homeMap}
            width='800'
            height='400'
            center={[0, 0]}
            zoom={1}
          >
            {({ TileLayer, Marker, Popup }, Leaflet) => (
              <>
                <TileLayer
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {destinations?.map(
                  ({ id, arrival, departure, location, city, region }) => {
                    const arrivalDate = new Date(arrival)
                    const arrivalHours = arrivalDate.getHours()
                    const arrivalMinutes = arrivalDate.getMinutes()
                    const arrivalTime = `${arrivalHours}:${arrivalMinutes}`

                    const departureDate = new Date(departure)
                    const departureHours = departureDate.getHours()
                    const departureMinutes = departureDate.getMinutes()
                    const departureTime = `${departureHours}:${departureMinutes}`

                    const santaWasHere =
                      currentDate.getTime() - departureDate.getTime() > 0
                    const santaIsHere =
                      currentDate.getTime() - arrivalDate.getTime() > 0 &&
                      !santaWasHere

                    let iconUrl = '/images/tree-marker-icon.png'
                    let iconRetinaUrl = '/images/tree-marker-icon-2x.png'

                    if (santaWasHere) {
                      iconUrl = '/images/gift-marker-icon.png'
                      iconRetinaUrl = '/images/gift-marker-icon-2x.png'
                    }

                    if (santaIsHere) {
                      iconUrl = '/images/santa-marker-icon.png'
                      iconRetinaUrl = '/images/santa-marker-icon-2x.png'
                    }

                    let className = ''

                    if (santaIsHere) {
                      className = `${className} ${styles.iconSantaIsHere}`
                    }

                    return (
                      <Marker
                        key={id}
                        position={[location.lat, location.lng]}
                        icon={Leaflet.icon({
                          iconUrl,
                          iconRetinaUrl,
                          iconSize: [41, 41],
                        })}
                      >
                        <Popup>
                          <strong>Location:</strong> {city}, {region}
                          <br />
                          <strong>
                            Arrival:
                          </strong> {arrivalDate.toDateString()} @ {arrivalTime}
                          <br />
                          <strong>Departure:</strong>{' '}
                          {arrivalDate.toDateString()} @ {departureTime}
                        </Popup>
                      </Marker>
                    )
                  }
                )}
              </>
            )}
          </Map>
        </Container>
      </Section>
    </Layout>
  )
}

export default Home
