import PageNotFound from '@/components/PageNotFound'
import { Route, Routes } from 'react-router-dom'
import Home from './Home/Home'

const Frontend = () => {


  return (
    <>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  )
}

export default Frontend
