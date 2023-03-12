import { useQueries } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { z } from 'zod'
import { fetchF1Data, Loading } from '../index'

async function getDriver(driverId: string): Promise<any> {
  try {
    const response = await fetchF1Data(
      `drivers/${driverId}`
    )
    return response?.MRData?.DriverTable?.Drivers[0]
  } catch (error) {
    console.error(`Error: ${error}`)
    throw new Error(`Error: ${error}`)
  }
}

async function getResults(driverId: string) {
  try {
    const response = await fetchF1Data(
      `drivers/${driverId}/results`
    )
    return response.MRData.RaceTable.Races
  } catch (error) {
    console.error(`Error: ${error}`)
    throw new Error(`Error: ${error}`)
  }
}

const individualDriverSchema = z.object({
  Circuit: z.object({
    Location: z.object({
      country: z.string(),
      lat: z.string(),
      locality: z.string(),
      long: z.string(),
    }),
    circuitId: z.string(),
    circuitName: z.string(),
  }),
  Results: z.array(
    z.object({
      Constructor: z.object({
        constructorId: z.string(),
        name: z.string(),
        nationality: z.string(),
      }),
      Driver: z.object({
        code: z.string(),
        dateOfBirth: z.string(),
        driverId: z.string(),
        familyName: z.string(),
        givenName: z.string(),
        nationality: z.string(),
        permanentNumber: z.string(),
      }),
      grid: z.string(),
      laps: z.string(),
      number: z.string(),
      points: z.string(),
      position: z.string(),
      positionText: z.string(),
      status: z.string(),
    })
  ),
  date: z.string(),
  raceName: z.string(),
  round: z.string(),
  season: z.string(),
})

const resultsSchema = z.object({
  Constructor: z.object({
    constructorId: z.string(),
    name: z.string(),
    nationality: z.string(),
  }),
  Driver: z.object({
    code: z.string(),
    dateOfBirth: z.string(),
    driverId: z.string(),
    familyName: z.string(),
    givenName: z.string(),
    nationality: z.string(),
    permanentNumber: z.string(),
  }),
  FastestLap: z.object({
    lap: z.string(),
    rank: z.string(),
  }),
  grid: z.string(),
  laps: z.string(),
  number: z.string(),
  points: z.string(),
  position: z.string(),
  positionText: z.string(),
  status: z.string(),
})

const racesSchema = z.object({
  Circuit: z.object({
    Location: z.object({
      country: z.string(),
      lat: z.string(),
      locality: z.string(),
      long: z.string(),
    }),
  }),
  Results: z.array(resultsSchema),
  date: z.string(),
  raceName: z.string(),
  round: z.string(),
  season: z.string(),
})








type Races = z.infer<typeof racesSchema>
type Kind = 'position' | 'grid'

function getDriverStats(
  results: Races[],
  key: Kind,
  value: number | string
) {
  return results?.reduce((total, current) => {
    if (current?.Results[0][key] === value) {
      total += 1
    }
    return total
  }, 0)
}

type Races1 = z.infer<typeof racesSchema>
type Kind1 = 'rank'
type Kind2 = 'points'

function getDriverStats1(
  results: Races1[],
  key: Kind1,
  value: number | string
) {
  return results?.reduce((total, current) => {
    if (current?.Results[0]['status'] != "Withdrew"){
      if (current?.Results[0].FastestLap?.[key] === value) {
        total += 1
      }
    }
      return total
    }, 0)
  }

function getDriverPoints(
  results: Races[],
  key: Kind2,
  value: number | string
) {
  return results?.reduce((totally, current) => {
      // if (current?.Results[0][key] === value) {
        totally += parseInt(current?.Results[0][key])
    // }
      return totally
    }, 0)
  }

export default function Driver() {
  const router = useRouter()
  const { driver } = router.query

  const [driverQuery, resultsQuery] = useQueries({
    queries: [
      {
        queryKey: ['individual_driver', driver],
        queryFn: () => getDriver(String(driver)),
      },
      {
        queryKey: ['results', driver],
        queryFn: () => getResults(String(driver)),
      },
    ],
  })

  if (driverQuery.isLoading || resultsQuery.isLoading)
    return <Loading />
  if (driverQuery.error || resultsQuery.error)
    return (
      <p className="flex items-center justify-center h-screen w-screen text-9xl">
        Error! :((((
      </p>
    )

    const wins = getDriverStats(
      resultsQuery.data,
      'position',
      '1'
    )

    const poles = getDriverStats(
      resultsQuery.data,
      'grid',
      '1'
    )

    const points = getDriverPoints(
      resultsQuery.data,
      'points',
      '1'
    )

    const poles1 = getDriverStats1(
      resultsQuery.data,
      'rank',
      '1'
    )
  // console.log(resultsQuery)
  return (
    <div>
      <h1 className="text-6xl text-center mt-8">
        {driverQuery.data.givenName}{' '}
        {driverQuery.data.familyName}
      </h1>
      <br></br>
      {/* <thead> */}
      <table  className="w-full relative">
        <tr>
          <th>Wins</th>
          <th>{wins}</th>
        </tr>
        <tr>
          <th>Poles</th>
          <th>{poles}</th>
        </tr>
        <tr>
          <th>Points</th>
          <th>{points}</th>
        </tr>
        <tr>
          <th>Fastest Laps</th>
          <th>{poles1}</th>
        </tr>
      </table>
      {/* </thead> */}
    </div>
  )
}


